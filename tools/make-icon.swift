// Renders a game icon: an emoji on a vertical gradient, as a square PNG.
// Usage: swift tools/make-icon.swift "🐸" "#4fd1c5" "#2b6cb0" games/frog/icon.png
import AppKit

func color(_ hex: String) -> NSColor {
  let value = Int(hex.replacingOccurrences(of: "#", with: ""), radix: 16) ?? 0
  return NSColor(srgbRed: CGFloat(value >> 16 & 255) / 255, green: CGFloat(value >> 8 & 255) / 255,
                 blue: CGFloat(value & 255) / 255, alpha: 1)
}

let arguments = CommandLine.arguments
let glyph = arguments[1]
let size: CGFloat = 256
let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(size), pixelsHigh: Int(size),
                              bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                              colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
NSGradient(starting: color(arguments[2]), ending: color(arguments[3]))!
  .draw(in: NSRect(x: 0, y: 0, width: size, height: size), angle: -90)
let text = NSAttributedString(string: glyph, attributes: [.font: NSFont.systemFont(ofSize: size * 0.58)])
let bounds = text.size()
text.draw(at: NSPoint(x: (size - bounds.width) / 2, y: (size - bounds.height) / 2 - size * 0.01))
NSGraphicsContext.restoreGraphicsState()
try! bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: arguments[4]))
