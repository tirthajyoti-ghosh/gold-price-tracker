import { useState, useEffect, useRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import ChartAnnotation from "chartjs-plugin-annotation";
import { DateRange } from "react-day-picker";
import { parse, format } from "date-fns";
import axios from "axios";
import { LineChart } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import DateRangePicker from "./components/DateRangePicker";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

ChartJS.register(ChartAnnotation);

type GoldPrice = {
    data: string;
    cena: number;
};

function maxProfit(data: GoldPrice[], userInvestment: number) {
    let maxProfit = 0;
    let buyDate = "";
    let sellDate = "";
    let minima = data[0].cena;
    let maxima = data[0].cena;

    for (let i = 0; i < data.length - 1; i++) {
        for (let j = i + 1; j < data.length; j++) {
            const profit = data[j].cena - data[i].cena;
            if (profit > maxProfit) {
                maxProfit = profit;
                buyDate = data[i].data;
                minima = data[i].cena;
                sellDate = data[j].data;
                maxima = data[j].cena;
            }
        }
    }

    const noOfShares = userInvestment / minima;
    const finalAmount = noOfShares * maxima;
    const returns = finalAmount - userInvestment;
    const returnsPercentage = (returns / userInvestment) * 100;

    return {
        buyDate,
        sellDate,
        profit: maxProfit,
        returnsPercentage,
        actualReturns: returns,
        finalAmount,
    };
}

export default function App() {
    const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([]);
    const [dateRange, setDateRange] = useState<DateRange>();
    const [progress, setProgress] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [investment, setInvestment] = useState(0);
    const [analysis, setAnalysis] = useState({
        buyDate: "",
        sellDate: "",
        profit: 0,
        returnsPercentage: 0,
        actualReturns: 0,
        finalAmount: 0,
    });
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const source = axios.CancelToken.source();

        const fetchGoldPrices = async () => {
            setProgress(10);
            const interval = setInterval(() => {
                setProgress((oldProgress) => {
                    if (oldProgress === 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    const diff = Math.random() * 30;
                    return Math.min(oldProgress + diff, 100);
                });
            }, 200);

            try {
                if (!dateRange?.from || !dateRange?.to) {
                    setGoldPrices([]);
                    setIsLoading(false);
                    setAnalysis({
                        buyDate: "",
                        sellDate: "",
                        profit: 0,
                        returnsPercentage: 0,
                        actualReturns: 0,
                        finalAmount: 0,
                    });
                    return;
                }
                setIsLoading(true);
                const { from, to } = dateRange;
                const response = await axios.get<GoldPrice[]>(
                    `https://gold-price-tracker.cyclic.app/?start=${from?.toISOString()}&end=${to?.toISOString()}`,
                    { cancelToken: source.token }
                );
                setGoldPrices(response.data);
                setIsLoading(false);
                setProgress(100);
                if (inputRef.current && inputRef.current.value !== "0") {
                    setAnalysis(
                        maxProfit(response.data, Number(inputRef.current.value))
                    );
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log("Request canceled", error.message);
                } else {
                    console.error(error);
                }
                setIsLoading(false);
            }
        };

        fetchGoldPrices();

        return () => {
            source.cancel("Operation canceled by the user.");
        };
    }, [dateRange]);

    return (
        <div className="flex justify-center p-4 sm:p-10">
            <div className=" mt-5 max-w-full sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-5xl mb-5">
                <h1 className="text-3xl font-bold mb-10">
                    Gold price tracker + Investment analysis
                </h1>
                <Label>Select a date range</Label>
                <DateRangePicker
                    handleDateChange={setDateRange}
                    className="w-full sm:w-[300px] mb-5"
                />

                {goldPrices.length > 2 && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setAnalysis(maxProfit(goldPrices, investment));
                        }}
                        className="w-full sm:w-[300px] max-w-sm"
                    >
                        <Label>Analyze your investment</Label>
                        <Input
                            ref={inputRef}
                            value={investment}
                            onChange={(e) =>
                                setInvestment(Number(e.target.value))
                            }
                            type="number"
                            placeholder="Enter amount"
                        />
                        <Button
                            type="submit"
                            className="mt-2"
                            disabled={isLoading || investment === 0}
                        >
                            Analyze
                        </Button>
                    </form>
                )}
                <div className="relative w-full sm:w-[900px] sm:h-[400px] h-[300px] mt-10">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 bottom-10">
                            <Progress value={progress} className="w-60 h-1" />
                        </div>
                    )}
                    {!isLoading && goldPrices.length === 0 && (
                        <div className="w-full sm:w-[1000px] sm:h-[400px] h-[300px] absolute inset-0 flex items-center justify-center bottom-10">
                            <div className="border border-gray-300 bg-white rounded p-4 flex flex-col items-center space-x-2">
                                <LineChart className="h-12 w-12 text-gray-500 mb-3" />
                                <span className="text-gray-500">
                                    Select a date range to see gold prices
                                </span>
                            </div>
                        </div>
                    )}
                    <Line
                        className="w-full h-full"
                        options={{
                            responsive: true,
                            elements: {
                                line: {
                                    tension: 0.5,
                                },
                            },
                            plugins: {
                                annotation: {
                                    clip: false,
                                    ...(analysis.buyDate && analysis.sellDate
                                        ? {
                                              annotations: {
                                                  buyPoint: {
                                                      type: "line",
                                                      xMin: analysis.buyDate,
                                                      xMax: analysis.buyDate,
                                                      borderColor:
                                                          "rgb(0, 255, 0)",
                                                      borderWidth: 2,
                                                  },
                                                  sellPoint: {
                                                      type: "line",
                                                      xMin: analysis.sellDate,
                                                      xMax: analysis.sellDate,
                                                      borderColor:
                                                          "rgb(255, 0, 0)",
                                                      borderWidth: 2,
                                                  },
                                                  buyPointLabel: {
                                                      type: "label",
                                                      xMin: analysis.buyDate,
                                                      xMax: analysis.buyDate,
                                                      backgroundColor:
                                                          "rgba(0, 255, 0, 0.5)",
                                                      content: "Buy",
                                                      yAdjust: -10,
                                                  },
                                                  sellPointLabel: {
                                                      type: "label",
                                                      xMin: analysis.sellDate,
                                                      xMax: analysis.sellDate,
                                                      backgroundColor:
                                                          "rgba(255, 0, 0, 0.5)",
                                                      content: "Sell",
                                                      yAdjust: -10,
                                                  },
                                              },
                                          }
                                        : {}),
                                },
                                tooltip: {
                                    enabled: true,
                                    titleFont: {
                                        size: 16,
                                        family: "Lato",
                                        style: "normal",
                                    },
                                    bodyFont: { size: 14, family: "Lato" },
                                    footerFont: { size: 12, family: "Lato" },
                                    backgroundColor: "rgba(255, 255, 255, 1)",
                                    titleColor: "#000000",
                                    bodyColor: "#000000",
                                    footerColor: "#000000",
                                    borderColor: "#000000",
                                    borderWidth: 1,
                                    callbacks: {
                                        title: function (context) {
                                            const date = parse(
                                                context[0].label,
                                                "yyyy-MM-dd",
                                                new Date()
                                            );
                                            return format(
                                                date,
                                                "MMMM dd, yyyy"
                                            );
                                        },
                                    },
                                },
                                legend: {
                                    display: false,
                                },
                                title: {
                                    display: false,
                                },
                            },
                        }}
                        data={{
                            labels:
                                goldPrices.length > 0
                                    ? goldPrices.map((goldPrice) =>
                                          format(
                                              parse(
                                                  goldPrice.data,
                                                  "yyyy-MM-dd",
                                                  new Date()
                                              ),
                                              "yyyy-MM-dd"
                                          )
                                      )
                                    : [],
                            datasets: [
                                {
                                    label: "Price",
                                    data:
                                        goldPrices.length > 0
                                            ? goldPrices.map(
                                                  (goldPrice) => goldPrice.cena
                                              )
                                            : [],
                                    fill: false,
                                    backgroundColor: "rgba(15, 23, 41, 0.205)",
                                    borderColor: "rgb(15, 23, 41)",
                                },
                            ],
                        }}
                    />
                    {analysis.buyDate && analysis.sellDate && (
                        <div className="mt-5 mb-5 bg-white p-5 rounded shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">
                                Analysis:
                            </h2>
                            <p className="text-lg mb-2">
                                Buy Date: {format(new Date(analysis.buyDate), "MMM dd, yyyy")}
                            </p>
                            <p className="text-lg mb-2">
                                Sell Date: {format(new Date(analysis.sellDate), "MMM dd, yyyy")}
                            </p>
                            <p className="text-lg mb-2">
                                Profit per share: {analysis.profit.toFixed(2)} (
                                {analysis.returnsPercentage.toFixed(2)}%)
                            </p>
                            <p className="text-lg">
                                ROI: {Math.round(analysis.finalAmount).toFixed(2)} (+{analysis.actualReturns.toFixed(2)})
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
