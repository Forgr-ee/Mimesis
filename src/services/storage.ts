import { Storage } from "@capacitor/storage";

export const setStorage = async (key: string, value: any) => {
    await Storage.set({
        key,
        value: typeof value === "string" ? value : JSON.stringify(value),
    });
};

export const getStorage = async (key: string, defaultValue: any = null) => {
    const res = await Storage.get({ key });
    try {
        return res.value ? JSON.parse(res.value) : defaultValue;
    } catch {
        return res.value ? res.value : defaultValue;
    }
};