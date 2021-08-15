export const randomSelect = (filtered: any[]) => {
    return filtered[Math.floor(Math.random() * filtered.length)];
};