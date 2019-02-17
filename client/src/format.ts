export const formatDataSize = (count: number) => {
    if (count < 1024) { return `${count} B`; }
    count = Math.round(count / 1024);
    if (count < 1024) { return `${count} KB`; }
    count = Math.round(count / 1024);
    if (count < 1024) { return `${count} MB`; }
    count = Math.round(count / 1024);
    if (count < 1024) { return `${count} GB`; }
    count = Math.round(count / 1024);
    if (count < 1024) { return `${count} TB`; }
};
