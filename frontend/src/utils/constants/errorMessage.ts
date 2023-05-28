export const ERROR_MESSAGE = {
    forbidden: 'У вас нет прав доступа к этой странице',
    notAuth: 'Вы не авторизованы',
    notFound: 'Неизвестная ошибка',
    serverUnavailable: 'Сервер недоступен, повторите попытку позже',
};

export const ERROR_STATUS = {
    404: ERROR_MESSAGE.notFound,
    403: ERROR_MESSAGE.forbidden,
    401: ERROR_MESSAGE.notAuth,
    500: ERROR_MESSAGE.serverUnavailable,
};

export const ERROR_PAGE_BUTTON_TEXT = {
    toLogin: 'Вернуться на страницу логина',
    toMain: 'Вернуться на главную',
};
