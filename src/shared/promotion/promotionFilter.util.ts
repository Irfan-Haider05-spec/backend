export const isValidPromotion = (promo: any, today: Date, todayDay: string, userSegment?: string) => {
  const startDate = new Date(promo.startDate);
  const endDate = new Date(promo.endDate);

  const isValidDate = today >= startDate && today <= endDate;

  const isValidDay =
    promo.availableDays?.includes("all") ||
    promo.availableDays?.includes(todayDay);

  const isSegmentMatch =
    !promo.customerSegment ||
    promo.customerSegment.includes("all") ||
    promo.customerSegment.includes(userSegment || "all_customer");

  return promo.status === "active" && isValidDate && isValidDay && isSegmentMatch;
};