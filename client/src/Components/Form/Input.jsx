import { useFormContext, Controller, useController } from "react-hook-form"
import { useState, useRef, useEffect, forwardRef } from 'react'
import {Link, Button, Checkbox, Radio, FormControlLabel, RadioGroup, Select, MenuItem, IconButton} from '@mui/material'
import { trimMultilineText, findInputError, isFormInvalid, blobToBase64, humanFileSize, combineValidations} from "../../utils"
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';

export const CheckboxInput = ({name, label}) => {
    const { control } = useFormContext()
    const {field} = useController({
        name, control,
        defaultValue: false
    })

    return (
        <FormControlLabel
            control={
                <Checkbox
                    {...field}
                    checked={field.value}
                />
            }
            label={label}
        />
    )
}

export const SelectInput = ({name, label, options, emptyLabel, disableEmpty, onChange, validation}) => {
    const { control } = useFormContext()
    const {field} = useController({
        name, control,
        defaultValue: '',
        onChange,
        rules: validation
    })

    return (
        <InputWrapper 
            name={name}
            label={label}
        >
            <Select
                onChange={(e) => {
                    if (onChange)
                        onChange(e.target.value)
                    field.onChange(e)
                }}
                value={field.value}
                size="small"
                displayEmpty={true}
                sx={{backgroundColor:'white'}}
            >

                {!disableEmpty && (
                    <MenuItem value="">
                        {emptyLabel ?? "Не выбрано"}
                    </MenuItem>
                )}

                {options.map((o, i) => (
                    <MenuItem value={o.value} key={i}>
                        {o.label}
                    </MenuItem>
                ))}

            </Select>
        </InputWrapper>
    )
}

export const RadioGroupInput = ({name, label, options, onChange}) => {
    const { control } = useFormContext()
    const {field} = useController({
        name, control
    })

    return (
        <InputWrapper name={name} label={label}>
            <RadioGroup
                {...field}
                onChange={(e) => {
                    if(onChange)
                        onChange(e.target.value)
                    field.onChange(e)
                }}
            >
                {options.map((op, i) => (
                    <FormControlLabel key={i} value={op.value} control={<Radio />} label={op.label} />
                ))}
            </RadioGroup>    
        </InputWrapper>

    )
}

export const NumericInput = ({label, name, placeholder, validation, allowNegative, isFloat, onChange, valueTransform}) => {

    const filter = (ch, value) => {
        if ('0123456789'.includes(ch))
            return true
        if (ch == '.' && isFloat && !value.includes('.'))
            return true
        if (ch == '-' && allowNegative && value.length == 0)
            return true
        return false
    }

    return (
        <SimpleInput
            label={label} 
            name={name}
            type="text"
            onChange={onChange}
            placeholder={placeholder} 
            validation={validation}
            valueTransform={w => {
                const t = !w? 0 : isFloat? parseFloat(w) : parseInt(w)
                return valueTransform? valueTransform(t) : t
            }}
            characterFilter={filter}
        />
    )

}

export const SimpleInput = ({label, type, name, placeholder, validation, valueTransform, onChange, characterFilter}) => {
    const { register } = useFormContext()

    if(valueTransform === undefined && type === 'text')
        valueTransform = trimMultilineText

    return (
        <InputWrapper label={label} name={name}>
            <RawSimpleInput
                type={type}
                placeholder={placeholder}
                {...register(name, {
                    ...validation,
                    setValueAs: valueTransform,
                    onChange: (e) => {
                        const val = valueTransform? valueTransform(e.target.value) : e.target.value
                        if (onChange)
                            onChange(val, e)
                    }
                })}
                onKeyDown={(e) => {
                    if(!e.ctrlKey && e.key.length == 1 && characterFilter && !characterFilter(e.key, e.target.value))
                        e.preventDefault()
                }}
            />
        </InputWrapper>
    )
}

export const TextAreaInput = ({label, name, placeholder, validation, valueTransform, onChange}) => {
    const { register } = useFormContext()

    if(valueTransform === undefined)
        valueTransform = trimMultilineText

    return (
        <InputWrapper label={label} name={name}>
            <textarea
                className="w-full p-4 font-medium border rounded-md border-slate-300 placeholder:opacity-60" 
                name={name}
                placeholder={placeholder}
                {...register(
                    name, {
                        ...validation,
                        setValueAs: valueTransform,
                        onChange: (e) => {
                            const val = valueTransform? valueTransform(e.target.value) : e.target.value
                            if (onChange)
                                onChange(val, e)
                        }
                    }
                )}
            >
            </textarea>
        </InputWrapper>
    )
}

export function InputWrapper({name, label, children}) {
    const { formState: { errors } } = useFormContext()
    const inputError = findInputError(errors, name)
    const isInvalid = isFormInvalid(inputError)

    return (
        <div className="flex flex-col w-full gap-2">
            {label && (
                <div className="flex justify-between">
                    <span className="font-semibold">
                        {label}
                    </span>
                </div>
            )}
            {children}
            {isInvalid && <span className="w-full red-800 font-medium font-semibold">{inputError.error.message}</span>}
        </div>
    )
}

export const RoublePriceInput = ({label, name, placeholder, validation, allowZero, onChange}) => {
    const v = combineValidations({
        validate: {
            is_invalid: (v) => !isNaN(v) && v >= 0 || "Некорректное значение!",
            too_small: (v) => allowZero || v >= 0.01 || "Слишком мало!",
            too_large: (v) => v <= 1e+6 || "Слишком много!"
        },
        required: {
            message: 'Необходимо заполнить!',
            value: true
        }
    }, validation)

    return (
        <NumericInput
            name={name}
            label={label}
            isFloat={true}
            allowNegative={false}
            placeholder={placeholder}
            validation={v}
            onChange={onChange}
            valueTransform={(t) => Math.floor(t * 100) / 100}
        />
    )
}

export const ItemIconInput = ({label, name, validation, maxSizeBytes}) => {
    const {register, setValue} = useFormContext()
    const [imageSrc, setImageSrc] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [isDraggedOver, setDraggedOver] = useState(false)

    useEffect(() => {
        register(name, {...validation})
    }, [])

    const hasCorrectType = (f) => f.type == 'image/jpeg' || f.type == 'image/png'

    const onDragOver = (e) => {
        e.stopPropagation()
        e.preventDefault()
        setErrorMessage(null)
        setDraggedOver(true)
    }

    const onDragLeave = (e) => {
        e.stopPropagation()
        e.preventDefault()
        setDraggedOver(false)
    }

    const onDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        const files = [...e.dataTransfer.files]

        setDraggedOver(false)

        if (files.length == 0)
            return
        else if (files.length > 1)
            setErrorMessage({tooMany: true})
        else if(!hasCorrectType(files[0]))
            setErrorMessage({invalidType: true})
        else if(maxSizeBytes && files[0].size > maxSizeBytes)
            setErrorMessage({tooLarge: true})
        else {
            setValue(name, files[0])
            blobToBase64(files[0]).then(setImageSrc)
        }
    }

    const browseFile = () => {
        const inp = document.createElement('input')

        inp.type = 'file'
        inp.multiple = false
        inp.accept = '.jpg,.jpeg,.png'

        inp.addEventListener('change', () => {
            const files = [...inp.files]

            if(maxSizeBytes && files[0].size > maxSizeBytes)
                setErrorMessage({tooLarge: true})
            else {
                setValue(name, files[0])
                blobToBase64(files[0]).then(setImageSrc)
            }
        })

        inp.click()
    }

    const resetImage = () => {
        setValue(name, null)
        setImageSrc(null)
    }

    return (
        <InputWrapper label={label} name={name}>
            <div className="w-full h-full max-w-[300px] bg-gray-200 p-3 rounded-xl">
                {!imageSrc && (
                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={"w-full h-full min-h-[150px] flex flex-col justify-center items-center gap-1 border-2 border-gray-400 " + (isDraggedOver? "border-solid" : "border-dashed")}
                    >
                        {!isDraggedOver && errorMessage && (
                            <>
                                <span className="text-red-600 pointer-events-none text-center">
                                    {errorMessage.tooMany && "Слишком много файлов!"}
                                    {errorMessage.invalidType && "Принимаются только JPEG и PNG изображения!"}
                                    {errorMessage.tooLarge && `Превышен лимит в ${humanFileSize(maxSizeBytes, true)}!`}
                                </span>

                                <Button onClick={() => setErrorMessage(null)}>ОК</Button>
                            </>
                        )}

                        {!isDraggedOver && !errorMessage && (
                            <>
                                <span className="pointer-events-none">Перетащите файлы сюда</span>
                                <span className="pointer-events-none">или</span>
                                <Button onClick={browseFile}>Нажмите для обзора</Button>                        
                            </>
                        )}

                        {isDraggedOver && (
                            <span className="pointer-events-none">Отпустите</span>
                        )}
                    </div>
                )}

                {imageSrc && (
                    <>
                        <img src={imageSrc} className="w-full mb-1"/>
                        <Link component="button" underline="hover" onClick={resetImage}>Удалить фото</Link>
                    </>
                )}
            </div>
        </InputWrapper>
    )


}

export const RawSimpleInput = forwardRef((props, ref) => (
    <input
        className="w-full p-4 font-medium border rounded-md border-slate-300 placeholder:opacity-60"
        ref={ref}
        {...props}
    />
))

export const RawCounter = ({value, onChange, clearButton, minValue, maxValue}) => {
    const handleSet = (newCount) => {

        if (maxValue !== undefined && newCount > maxValue)
            newCount = maxValue
        if (minValue !== undefined && newCount < minValue)
            newCount = minValue

        onChange(newCount)
    }

    const handleChange = (delta) => {
        handleSet(value + delta)
    }

    return (
        <div className="flex gap-1 items-center">
            <IconButton onClick={() => handleChange(-1)}><RemoveIcon/></IconButton>
            <span className="text-xl">{value}</span>
            <IconButton onClick={() => handleChange(1)}><AddIcon/></IconButton>
            {clearButton && (
                <IconButton onClick={() => handleSet(0)}><ClearIcon/></IconButton>
            )}
        </div>
    )
}


export const Counter = ({onChange, clearButton, name, label, validation, minValue, maxValue}) => {
    const { control } = useFormContext()
    const {field} = useController({
        name, control,
        defaultValue: 0,
        rules: validation
    })

    return (
        <InputWrapper name={name} label={label}>
            <RawCounter 
                value={field.value}
                onChange={(count) => {
                    if (onChange) onChange(count)
                    field.onChange(count)
                }}
                minValue={minValue}
                maxValue={maxValue}
                clearButton={clearButton}
            />
        </InputWrapper>
    )

}

