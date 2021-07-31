/**
 * copy from resource-loader 
 * @link https://github.com/englercj/resource-loader
 */
export type Overwrite<T1, T2> = {
    [P in Exclude<keyof T1, keyof T2>]: T1[P]
} & T2;

/**
 * Extracts the extension (sans '.') of the file being loaded by the resource.
 */
export function getExtension(url: string)
{
    const isDataUrl = url.indexOf('data:') === 0;
    let ext = '';

    if (isDataUrl)
    {
        const slashIndex = url.indexOf('/');

        ext = url.substring(slashIndex + 1, url.indexOf(';', slashIndex));
    }
    else
    {
        const queryStart = url.indexOf('?');
        const hashStart = url.indexOf('#');
        const index = Math.min(
            queryStart > -1 ? queryStart : url.length,
            hashStart > -1 ? hashStart : url.length
        );

        url = url.substring(0, index);
        ext = url.substring(url.lastIndexOf('.') + 1);
    }

    return ext.toLowerCase();
}
