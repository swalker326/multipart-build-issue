import {
	useForm,
	getInputProps,
	getTextareaProps,
	getFormProps,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";

export const FormSchema = z.object({
	email: z
		.string({ required_error: "Email is required" })
		.email("Email is invalid"),
	id: z.string(),
	message: z
		.string({ required_error: "Message is required" })
		.min(10, "Message is too short")
		.max(100, "Message is too long"),
});

export function ContactForm() {
	const fetcher = useFetcher({ key: "contact" });
	const [form, fields] = useForm({
		constraint: getZodConstraint(FormSchema),
		shouldValidate: "onBlur",
		shouldRevalidate: "onInput",
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: FormSchema });
		},
	});
	console.log(form.errors);
	return (
		<div>
			<span>Fetcher State: {fetcher.state}</span>;
			<fetcher.Form
				action="/sendMessage"
				method="POST"
				{...getFormProps(form)}
				encType="multipart/form-data"
			>
				<input type="hidden" name="id" value="contact" />
				<input type="file" name="uploadedFile" />
				<div>
					<label htmlFor={fields.email.id}>Email</label>
					<input
						className="border"
						{...getInputProps(fields.email, { type: "email" })}
					/>
					<div id={fields.email.errorId}>{fields.email.errors}</div>
				</div>
				<div>
					<label htmlFor={fields.message.id}>Message</label>
					<textarea className="border" {...getTextareaProps(fields.message)} />
					<div id={fields.message.errorId}>{fields.message.errors}</div>
				</div>
				<button type="submit">Send</button>
			</fetcher.Form>
		</div>
	);
}
