export type SeriesKey =
  | "day_ahead_quarter_hour"
  | "intraday_quarter_hour"
  | "intraday_auction_id1_quarter_hour"
  | "intraday_auction_id2_quarter_hour"
  | "intraday_auction_id3_quarter_hour";

export type SyncMode =
  | "all"
  | "day-ahead"
  | "intraday"
  | "intraday-id1"
  | "intraday-id2"
  | "intraday-id3";

export type SourcePoint = {
  timestampMs: number;
  priceEurMwh: number | null;
};

export type PersistedPricePoint = {
  seriesKey: SeriesKey;
  source: string;
  startAt: string;
  endAt: string;
  priceEurMwh: number;
  priceCtKwh: number;
};

export type WeekDataUrlInput = {
  startAt: Date;
  endAt: Date;
  timezone: string;
};
