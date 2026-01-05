import { ganaka } from "@ganaka/sdk";
import dayjs from "dayjs";
import dotenv from "dotenv";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dotenv.config();

dayjs.extend(utc);
dayjs.extend(timezone);

// the time window is assumed to be set in IST
const tradingWindowStart = dayjs()
  .set("year", 2025)
  .set("month", 11)
  .set("day", 26)
  .set("hour", 10)
  .set("minute", 0)
  .format("YYYY-MM-DDTHH:mm:ss");
const tradingWindowEnd = dayjs()
  .set("year", 2025)
  .set("month", 11)
  .set("day", 26)
  .set("hour", 10)
  .set("minute", 10)
  .format("YYYY-MM-DDTHH:mm:ss");

console.log({ tradingWindowStart });
console.log({ tradingWindowEnd });

async function main() {
  await ganaka({
    fn: async ({ fetchShortlist, fetchQuote, fetchCandles, placeOrder, currentTimestamp }) => {
      const currentTimestampIST = dayjs
        .tz(currentTimestamp, "Asia/Kolkata")
        .format("YYYY-MM-DDTHH:mm:ss");
      console.log(currentTimestampIST);

      const fetchShortlistResponse = await fetchShortlist({
        type: "top-gainers",
        datetime: currentTimestampIST,
      });
      console.log(fetchShortlistResponse);

      const fetchQuoteResponse = await fetchQuote({
        symbol: "TARC",
        datetime: currentTimestampIST,
      });
      console.log(fetchQuoteResponse);

      const fetchCandlesResponse = await fetchCandles({
        symbol: "TARC",
        interval: "1minute",
        start_datetime: currentTimestampIST,
        end_datetime: dayjs
          .tz(currentTimestampIST, "Asia/Kolkata")
          .add(1, "hour")
          .format("YYYY-MM-DDTHH:mm:ss"),
      });
      console.log(fetchCandlesResponse);

      await placeOrder({
        nseSymbol: "TARC",
        entryPrice: 100,
        stopLossPrice: 90,
        takeProfitPrice: 110,
        datetime: currentTimestampIST,
      });

      return;
    },
    intervalMinutes: 1,
    startTime: dayjs.tz(tradingWindowStart, "Asia/Kolkata").toDate(),
    endTime: dayjs.tz(tradingWindowEnd, "Asia/Kolkata").toDate(),
    deleteRunAfterCompletion: true,
  });
}

main();
