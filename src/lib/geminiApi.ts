// src/lib/geminiApi.ts

interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Simulates calling the Gemini API to generate an image.
 * In a real application, this would make a network request to a backend service.
 *
 * @param prompt - The text prompt to guide the image generation.
 * @param dimensions - The desired width and height of the image.
 * @returns A Promise that resolves to a Blob representing the generated image.
 */
export const generateImage = (
  prompt: string,
  dimensions: ImageDimensions
): Promise<Blob> => {
  console.log("Simulating Gemini API call with prompt:", prompt);

  return new Promise(resolve => {
    // Simulate network delay
    setTimeout(() => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Create a simple placeholder image
      ctx.fillStyle = "#cccccc";
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      ctx.fillStyle = "#333333";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Adjust font size based on image height
      const fontSize = Math.max(12, Math.min(dimensions.height / 4, 32));
      ctx.font = `${fontSize}px Arial`;

      ctx.fillText(
        `Generated: ${dimensions.width}x${dimensions.height}`,
        dimensions.width / 2,
        dimensions.height / 2
      );

      ctx.font = "10px Arial";
       ctx.fillText(
        `Prompt: ${prompt.substring(0, 50)}...`,
        dimensions.width / 2,
        dimensions.height / 2 + fontSize
      );


      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        }
      }, "image/png");
    }, 1000 + Math.random() * 1500); // Simulate variable network latency
  });
};
