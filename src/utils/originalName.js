/**
 * Strips the server's upload tag for display: 'a1b2c3d4_habitats.zip' -> 'habitats.zip'.
 * The server tags uploads so users uploading the same file can't clash in imports/.
 */
export const originalName = name => name?.replace(/^[0-9a-f]{8}_/, '')
