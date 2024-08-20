import {
	MultipartParseError,
	MultipartPart,
	parseMultipartRequest,
} from "@mjackson/multipart-parser";
import * as fsync from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

export async function handleMultipartRequest(request: Request) {
	const responseObject = new FormData();
	try {
		// The parser `yield`s each MultipartPart as it becomes available
		for await (const part of parseMultipartRequest(request)) {
			if (!part.name) {
				continue;
			}
			if (part.isFile) {
				if (!part.filename) {
					throw new Error("Missing filename for file part");
				}
				const file = writeStreamToFile(part.filename, part.body);
				responseObject.append(part.name, JSON.stringify(file));
			} else {
				const text = await part.text();
				responseObject.append(part.name, text);
			}
		}
		return responseObject;
	} catch (error) {
		if (error instanceof MultipartParseError) {
			console.error("Failed to parse multipart request:", error.message);
		} else {
			console.error("An unexpected error occurred:", error);
		}
	}
}

export async function writeStreamToFile(
	filename: string,
	stream: ReadableStream<Uint8Array>,
) {
	const tmpDir = os.tmpdir();
	const tmpFilename = path.join(tmpDir, filename);
	const file = fsync.createWriteStream(tmpFilename);
	let bytesWritten = 0;

	//@ts-expect-error - The stream is not a Node.js stream
	for await (const chunk of stream) {
		file.write(chunk);
		bytesWritten += chunk.byteLength;
	}

	file.end();

	return { size: bytesWritten, path: tmpFilename };
}
