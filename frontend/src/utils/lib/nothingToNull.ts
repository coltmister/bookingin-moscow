export const nothingToNull = (value: string | null): string | null => {
    if (value == null) {
        return null;
    } else {
        value = value.trim();

        if (value.length === 0) {
            return null;
        } else {
            return value;
        }
    }
};
