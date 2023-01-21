import { open, save } from '@tauri-apps/api/dialog'
import { basename, extname } from '@tauri-apps/api/path'
import { readBinaryFile, readTextFile, writeTextFile } from '@tauri-apps/api/fs'

export interface SelectedFile<T> {
  name: string
  path: string
  data: T
}

export async function openElf(): Promise<SelectedFile<Uint8Array> | null> {
  const result = await open({
    title: 'Select ELF',
    filters: [{
      name: 'ELF',
      extensions: ['elf']
    }],
    multiple: false,
    directory: false
  })

  if (!result || typeof result !== 'string') {
    return null
  }

  const name = await basename(result)
  const data = await readBinaryFile(result)

  return { name, path: result, data }
}

export async function readInputFile(path: string): Promise<SelectedFile<string | Uint8Array> | null> {
  const name = await basename(path)
  const extension = await extname(path)

  let data: string | Uint8Array

  switch (extension) {
    case 'elf':
      data = await readBinaryFile(path)
      break

    default:
      data = await readTextFile(path)
      break
  }

  return { name, path, data }
}

// Would be magic if this could also open ELF files.
export async function openInputFile(): Promise<SelectedFile<string | Uint8Array> | null> {
  const result = await open({
    title: 'Select File',
    multiple: false,
    directory: false
  })

  if (!result || typeof result !== 'string') {
    return null
  }

  return await readInputFile(result)
}

export async function selectSaveAssembly(): Promise<SelectedFile<undefined> | null> {
  const result = await save({
    title: 'Save File',
    filters: [
      {
        name: 'Assembly',
        extensions: ['asm', 's']
      }
    ]
  })

  if (!result) {
    return null
  }

  const name = await basename(result)

  return { name, path: result, data: undefined }
}

export async function writeFile(path: string, content: string) {
  await writeTextFile(path, content)
}
