import { Context } from "./workspace";

export const MyContext = Context("MyContext");

export default async function Start() {
    await MyContext.Load();
}