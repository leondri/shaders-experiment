const numbersShader = `
uniform float pixelSize;
uniform sampler2D fontTexture;

// Hash function for pseudo-random number generation
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 normalizedPixelSize = pixelSize / resolution;
    vec2 cellCoord = floor(uv / normalizedPixelSize);
    vec2 cellUV = fract(uv / normalizedPixelSize);
    
    // Sample the input buffer
    vec2 uvPixel = normalizedPixelSize * cellCoord;
    vec4 color = texture2D(inputBuffer, uvPixel);
    float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);
    
    // Only render numbers where there's visible geometry (front-facing)
    if (luma < 0.01) {
        outputColor = vec4(0.0, 0.0, 0.0, 0.0);
        return;
    }
    
    // Generate random number 0-9 for this cell (static)
    float random = hash(cellCoord);
    int digit = int(mod(floor(random * 10.0), 10.0));
    
    // Generate random size for this cell
    float sizeRandom = hash(cellCoord * 1.7);
    float cellSize = 0.5 + sizeRandom * 0.5;
    vec2 scaledUV = (cellUV - 0.5) / cellSize + 0.5;
    
    // Only render if within cell bounds
    if (scaledUV.x < 0.0 || scaledUV.x > 1.0 || scaledUV.y < 0.0 || scaledUV.y > 1.0) {
        outputColor = vec4(0.0, 0.0, 0.0, 0.0);
        return;
    }
    
    // Sample from font texture (10 digits in a row: 0-9)
    // Each digit occupies 1/10 of the texture width
    float digitU = (float(digit) + scaledUV.x) / 10.0;
    vec2 fontUV = vec2(digitU, scaledUV.y);
    vec4 fontColor = texture2D(fontTexture, fontUV);
    
    // White numbers with brightness based on luminance
    float brightness = max(luma, 0.2);
    outputColor = vec4(vec3(1.0) * fontColor.r * brightness, fontColor.r * brightness);
}
`;

export default numbersShader;
