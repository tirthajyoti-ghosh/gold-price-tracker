import { useState, useEffect } from "react";
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
import { DateRange } from "react-day-picker";
import { parse, format } from "date-fns";
import axios from "axios";
import { LineChart } from "lucide-react";

import { Progress } from "@/components/ui/progress";
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

type GoldPrice = {
    data: string;
    cena: number;
};

export default function App() {
    const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([]);
    const [dateRange, setDateRange] = useState<DateRange>();
    const [progress, setProgress] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

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
                if (!dateRange) {
                    setGoldPrices([]);
                    setIsLoading(false);
                    return;
                }
                setIsLoading(true);
                const { from, to } = dateRange;
                const response = await axios.get<GoldPrice[]>(
                    `http://localhost:5000/?start=${from?.toISOString()}&end=${to?.toISOString()}`,
                    { cancelToken: source.token }
                );
                setGoldPrices(response.data);
                setIsLoading(false);
                setProgress(100);
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
        <div className="flex justify-center h-screen">
            <div className="h-screen mt-5">
                <h1 className="text-3xl font-bold mb-10">Gold price tracker</h1>
                <DateRangePicker
                    handleDateChange={setDateRange}
                    className="w-[300px] mb-5"
                />
                <div className="relative w-[1000px] h-[600px]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                            <Progress value={progress} className="w-60 h-1" />
                        </div>
                    )}
                    {!isLoading && goldPrices.length === 0 && (
                        <div className="w-[1000px] h-[500px] absolute inset-0 flex items-center justify-center">
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
                                    display: Boolean(
                                        dateRange?.from && dateRange?.to
                                    ),
                                    text: `Fluctuations in gold prices from ${format(
                                        dateRange?.from || new Date(),
                                        "MMMM dd, yyyy"
                                    )} to ${format(
                                        dateRange?.to || new Date(),
                                        "MMMM dd, yyyy"
                                    )}`,
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
                </div>
            </div>
        </div>
    );
}
