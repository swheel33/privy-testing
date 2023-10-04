const getLocale = () => {
    return typeof navigator !== 'undefined' ? navigator.language : 'en-US'
}

export const formatNumber = (
    amount: number | string,
    minimumFractionDigits = 4,
    maximumFractionDigits = 4
): string => {
    const locale = getLocale()
    const numberForm = parseFloat(`${amount}`)
    if (maximumFractionDigits < minimumFractionDigits)
        maximumFractionDigits = minimumFractionDigits

    return new Intl.NumberFormat([locale, 'en-US'], {
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(numberForm)
}