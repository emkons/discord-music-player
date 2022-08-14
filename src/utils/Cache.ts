import Cache, { FileSystemCache } from "file-system-cache";

let cacheInstance: FileSystemCache | null = null;

export const initCache = (path: string, namespace: string = "") => {
    cacheInstance = Cache({
        basePath: path,
        ns: namespace,
    });
};

const serializeArgs = (...args: any[]) =>
    args.map((arg: any) => arg.toString()).join(":");

export function cache(key: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        let method = descriptor.value;
        descriptor.value = async function () {
            const cacheKey = serializeArgs(...arguments);
            const cachedResult = cacheInstance?.get(cacheKey);
            if (cachedResult !== undefined) {
                return cachedResult;
            }
            return method.apply(this, arguments).then((result: any) => {
                // If we have a result, cache it!
                if (result) {
                    cacheInstance?.set(cacheKey, result);
                }
                return result;
            });
        };
    };
}
