
export default function Page({title, documentTitle, children}) {

    if (documentTitle || title)
        document.title = documentTitle ?? title
    
    return (
        <>
            {title && (<h1 className='text-3xl mb-3'>{title}</h1>)}
            {children}
        </>
    )
}