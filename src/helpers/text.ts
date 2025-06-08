export const escapeHtmlChars = (text: string): string => {
    const replacements = [
        { searchValue: '&', replaceValue: '&amp;' },
        { searchValue: '<', replaceValue: '&lt;' },
        { searchValue: '>', replaceValue: '&gt;' },
        { searchValue: '"', replaceValue: '&quot;' },
        { searchValue: "'", replaceValue: '&#39;' },
        { searchValue: '`', replaceValue: '&#x60;' }
    ]

    replacements.forEach((replacement) => {
        text = text.replaceAll(replacement.searchValue, replacement.replaceValue)
    })

    return text
}

export const unescapeHtmlChars = (text: string): string => {
    const replacements = [
        { searchValue: '&amp;', replaceValue: '&' },
        { searchValue: '&lt;', replaceValue: '<' },
        { searchValue: '&gt;', replaceValue: '>' },
        { searchValue: '&quot;', replaceValue: '"' },
        { searchValue: '&#39;', replaceValue: "'" },
        { searchValue: '&#x60;', replaceValue: '`' }
    ]

    replacements.forEach((replacement) => {
        text = text.replaceAll(replacement.searchValue, replacement.replaceValue)
    })

    return text
}
