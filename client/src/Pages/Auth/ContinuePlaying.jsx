import Form from "../../Components/Form/Form";
import { SimpleInput } from "../../Components/Form/Input";
import { quickFetchPostJSON } from "../../utils";
import Page from "../../Components/Page";


export default function ContinuePlaying() {
    
    const handleSubmit = (data) => {
        
        return quickFetchPostJSON('/continue_playing', data)
        .then((r) => {
            if (r.error == 'COUNTRY_WAS_NOT_FOUND')
                return {muiError: 'Не найдено страны с таким именем!'}
            if(r.error == 'INCORRECT_PASSWORD')
                return {muiError: 'Неверный пароль!'}
            location.replace('/')
            return {muiSuccess: 'Успех!'}
        })
        .catch(() => {
            return {muiError: 'Не удалось войти!'}
        })
    }


    return (
        <Page title="Продолжить игру">
            <Form
                submitButtonLabel="Войти"
                onSubmit={handleSubmit}
                hints={[
                    {label: 'Создать страну', url: '/create_country'}
                ]}
            >
                <SimpleInput
                    name="name"
                    label="Название"
                    type="text"
                    placeholder="Лоскутное государство"
                />
                <SimpleInput
                    name="password"
                    label="Ключ в офис президента"
                    type="password"
                />
            </Form>
        </Page>
    )

}