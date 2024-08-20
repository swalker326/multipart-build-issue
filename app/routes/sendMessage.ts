import { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/react";
import { handleMultipartRequest } from "~/handleMultipartRequest";

const sendMessage = async (data: { email: string; message: string }) => {
	return { sent: true };
};

export async function action({ request }: ActionFunctionArgs) {
	const reqObject = await handleMultipartRequest(request);
	console.log("reqObject", reqObject);

	return json({ success: true });
}
