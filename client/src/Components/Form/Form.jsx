import '../../index.css'
import { useForm, FormProvider } from 'react-hook-form'
import {useRef, useState} from 'react'
import { Link, Button, Alert, AlertTitle } from '@mui/material'
import { prepareFormResult } from '../../utils'

export function FormAlert({result}) {
    result = prepareFormResult(result)

    if(!result)
        return <></>
    
    else if(!result.alert.muiType)
        return <span className="block">{result.alert.text}</span>
    
    else if(result.alert.muiType) {
        return (
            <Alert severity={result.alert.muiType} color={result.alert.muiType} variant='standard'>
                {result.alert.title && <AlertTitle>{result.alert.title}</AlertTitle>}
                {result.alert.text}
            </Alert>
        )
    }

    return <></>
}

export function MUIAwaitButton({onClick, activeText, awaitText, ...props}) {
    const [isAwait, setAwait] = useState(false)

    const handleClick = () => {
        setAwait(true)
        Promise.resolve(onClick())
        .catch(() => {})
        .then(() => {
            setAwait(false)
        })
    }

    return (
        <Button
            {...props}
            disabled={isAwait}
            onClick={handleClick}
        >
            {isAwait? awaitText ?? activeText : activeText}
        </Button>
    )
}


export default function Form({onSubmit, children, submitButtonLabel,
    hints, methodsRef, defaultValues, values, className, disableSubmitButton, additionalButtons}) {
        
        const methods = useForm({
            defaultValues,
            values
        })
        const [isSubmitEnabled, setSubmitEnabled] = useState(disableSubmitButton === true? false : true)
        const [result, setResult] = useState(null)

        const handledSubmit = methods.handleSubmit((data) => {
            return Promise.resolve(onSubmit(data))
            .then(r => {
                if(!r)
                    return
                else if(typeof r === 'string')
                    setResult({value: r, muiAlert: null})
                else {
                    setResult(r)
                    if (r.disableSubmit)
                        setSubmitEnabled(false)
                }
            })
        })

        if(methodsRef) {
            methodsRef.current = {
                ...methods,
                setResult,
                handledSubmit
            }
        }

        const buttons = [...additionalButtons??[]]

        if (isSubmitEnabled) {
            buttons.unshift(
                <MUIAwaitButton
                    type="submit"
                    variant="contained"
                    activeText={submitButtonLabel ?? 'Отправить'}
                    awaitText='Подождите...'
                    onClick={handledSubmit}
                />
            )
        }

        return (
                <FormProvider {...methods}>
                    <form
                        onSubmit={e => e.preventDefault()}
                        noValidate
                        className={className}
                    >
                        <div className="flex flex-col gap-3 items-start mb-3">
                                {children}
                        </div>

                        {hints && hints.length && (
                            <ul className="mb-3">
                                {hints.map((h, i) => (
                                    <li key={i}>
                                        <Link
                                            onClick={h.action}
                                            href={h.url ?? "#"}
                                            underline="hover"
                                        >
                                            {h.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <FormAlert result={result}/>

                        {buttons.length > 0 && (
                            <ul className="flex gap-1 mt-5">
                                {buttons.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                        )}
                        
                    </form>
                </FormProvider>
        
            )
}
