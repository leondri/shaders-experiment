const fragmentShader = `
uniform float pixelSize;

// Color palette: 4DDFEB, 00F6AA, 002B86, 045240, D0AFD5, F1815F, FEEB55, FFFFFF
vec3 getColorFromPalette(float index) {
    float n = mod(index, 8.0);
    
    if (n < 1.0) return vec3(0.302, 0.875, 0.922);   // #4DDFEB - Cyan
    else if (n < 2.0) return vec3(0.0, 0.965, 0.667);  // #00F6AA - Mint green
    else if (n < 3.0) return vec3(0.0, 0.169, 0.525);  // #002B86 - Deep blue
    else if (n < 4.0) return vec3(0.016, 0.322, 0.251); // #045240 - Dark green
    else if (n < 5.0) return vec3(0.816, 0.686, 0.835); // #D0AFD5 - Lavender
    else if (n < 6.0) return vec3(0.945, 0.506, 0.373); // #F1815F - Coral
    else if (n < 7.0) return vec3(0.996, 0.922, 0.333); // #FEEB55 - Yellow
    else return vec3(1.0, 1.0, 1.0);                    // #FFFFFF - White
}

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
    
    // Calculate pixel grid position for color variation
    vec2 pixelCoord = floor(uv / normalizedPixelSize);
    float colorIndex = pixelCoord.x + pixelCoord.y * 13.0; // Use prime number for better distribution

    float radius = luma > 0.5 ? 0.3 : luma > 0.001 ? 0.12 : 0.075;
    vec2 circleCenter = luma > 0.5 ? vec2(0.5, 0.5) : vec2(0.25, 0.25);

    float distanceFromCenter = distance(cellUV, circleCenter);

    float circleMask = smoothstep(radius, radius - 0.05, distanceFromCenter);
    
    // Get color from palette based on pixel position
    vec3 pixelColor = getColorFromPalette(colorIndex);
    
    // Apply the circle mask with colorful pixels based on luminance
    // Only show if there's actual content
    float finalLuma = max(luma, 0.05);
    outputColor = vec4(pixelColor * circleMask * finalLuma, color.a > 0.01 ? 1.0 : 0.0);
}
`;

export default fragmentShader;

