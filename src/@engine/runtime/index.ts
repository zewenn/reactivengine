import { Context } from "./workspace";

export const MyContext = Context("MyContext");
export const MyContext2 = Context("MyContext2");

export default async function Start() {
    await MyContext.Load();
    await MyContext2.Load();
}