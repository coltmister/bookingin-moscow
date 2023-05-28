export const authorize = () => {
    const form = document.querySelector('form#login') as HTMLFormElement;
    const formData = {
        client_id: 'iam',
        response_type: 'code',
        scope: 'openid profile',
        redirect_uri: window.location.origin + '/',
    };

    const createInput = (name: string, value: string, form: HTMLFormElement) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', name);
        input.setAttribute('value', value);

        form.appendChild(input);
    };
    function formDeserialize(form: HTMLFormElement, data: typeof formData) {
        const entries = Object.entries(data);
        const fields = entries.map((entry) => ({ [entry[0]]: entry[1] }));

        fields.forEach((field) => {
            for (const f in field) {
                createInput(f, field[f], form);
            }
        });
    }

    formDeserialize(form, formData);
    form.submit();
};
