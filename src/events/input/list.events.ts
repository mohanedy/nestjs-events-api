export class ListEvents {
  when: WhenEventFilter = WhenEventFilter.All;
  page: number = 1;
  limit: number = 10;
}

export enum WhenEventFilter {
  All = 1,
  Today,
  Tomorrow,
  ThisWeek,
  NextWeek,
}
