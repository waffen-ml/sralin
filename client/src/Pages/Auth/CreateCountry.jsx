import Form from "../../Components/Form/Form";
import { SimpleInput } from "../../Components/Form/Input";
import { quickFetchPostJSON } from "../../utils";
import Page from "../../Components/Page";


export default function CreateCountry() {
    
    const handleSubmit = (data) => {
        const toSend = {...data, passwordRep: undefined}
        
        return quickFetchPostJSON('/create_country', toSend)
        .then((r) => {
            if (r.error == 'NAME_IS_NOT_AVAILABLE')
                return {muiError: 'Это имя занято!'}
            location.replace('/')
            return {muiSuccess: 'Успех!'}
        })
        .catch(() => {
            return {muiError: 'Не удалось создать страну!'}
        })
    }

    return (
        <Page title="Создать страну">
            <Form
                submitButtonLabel="Создать"
                onSubmit={handleSubmit}
                hints={[
                    {label: 'Мне уже подконтрольна страна', url: '/continue_playing'}
                ]}
            >
                <SimpleInput
                    name="name"
                    label="Название"
                    type="text"
                    placeholder="Лоскутное государство"
                    validation={{
                        maxLength: {
                            value: 100,
                            message: 'Максимум 100 символов!'
                        },
                        minLength: {
                            value: 5,
                            message: 'Минимум 5 символов!'
                        }
                    }}
                />
                <SimpleInput
                    name="password"
                    label="Ключ в офис президента"
                    type="password"
                    validation={{
                        minLength: {
                            value: 5,
                            message: 'Минимум 5 символов!'
                        }
                    }}
                />
                <SimpleInput
                    name="passwordRep"
                    label="Повторите ключ"
                    type="password"
                    validation={{
                        validate: (val, other) => other.password == val || 'Ключи не совпадают!'
                    }}
                />
            </Form>
        </Page>
    )

}