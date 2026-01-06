const fragmentShader = `
uniform float pixelSize;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 normalizedPixelSize = pixelSize / resolution;
    float rowIndex = floor(uv.x / normalizedPixelSize.x);
    vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
    vec4 color = texture2D(inputBuffer, uvPixel);

    float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);
    
    // Only show pixels where there's actual content (luma above threshold or alpha > 0)
    // This prevents dots from appearing on transparent/black backgrounds
    if (luma < 0.01 && color.a < 0.01) {
        outputColor = vec4(0.0, 0.0, 0.0, 0.0);
        return;
    }

    vec2 cellUV = fract(uv / normalizedPixelSize);

    float radius = luma > 0.5 ? 0.3 : luma > 0.001 ? 0.12 : 0.075;
    vec2 circleCenter = luma > 0.5 ? vec2(0.5, 0.5) : vec2(0.25, 0.25);

    float distanceFromCenter = distance(cellUV, circleCenter);

    float circleMask = smoothstep(radius, radius - 0.05, distanceFromCenter);
    
    // White dots based on luminance
    vec3 whiteColor = vec3(1.0, 1.0, 1.0);
    
    // Apply the circle mask with white color based on luminance
    // Only show if there's actual content
    float finalLuma = max(luma, 0.05);
    outputColor = vec4(whiteColor * circleMask * finalLuma, color.a > 0.01 ? 1.0 : 0.0);
}
`;

export default fragmentShader;

