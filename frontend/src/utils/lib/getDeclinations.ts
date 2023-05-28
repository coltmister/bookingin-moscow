/**
 * Merges given count and on of declensions: one, few or many into a string
 * Соединяет переданное число и одно из трех склонений числительных в строку
 * @param {Object} config - необходимая конфигурация из числа, и склонений для количеств один, несколько и много
 * @param {number} config.count - количество чего-нибудь
 * @param {string} config.one - слово, описывающее один
 * @param {string} config.few - слово, описывающее несколько
 * @param {string} config.many - слово, описывающее много
 * @example
 * getDeclension({ count: 5, one: 'ребёнок', few: 'ребёнка', many: 'детей' });
 * // 5 детей
 * @return {string} строка из числа и нужного склонения
 */

interface GetDeclinationsProps {
    count: number;
    few: string;
    many: string;
    one: string;
}

export const getDeclinations = ({ count, few, many, one }: GetDeclinationsProps) => {
    const isFactional = Math.round(count) !== count;
    let declension = many;
    if (isFactional) {
        declension = few;
    } else {
        const units = Math.abs(count % 10);
        const tens = Math.abs(count % 100);
        if (units === 1 && tens !== 11) {
            declension = one;
        } else if (2 <= units && units <= 4 && (tens < 10 || 20 <= tens)) {
            declension = few;
        }
    }
    return `${count} ${declension}`;
};
