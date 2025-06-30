import { promises as fs } from 'fs';
import * as path from 'path';

async function backupProject() {
    const projectDir = path.resolve(__dirname, '..', '..');
    const backupDir = path.join(projectDir, 'backup');

    try {
        await fs.mkdir(backupDir, { recursive: true });

        const files = await fs.readdir(projectDir);
        for (const file of files) {
            const srcFile = path.join(projectDir, file);
            const destFile = path.join(backupDir, file);
            await fs.copyFile(srcFile, destFile);
        }

        console.log('Backup completed successfully.');
    } catch (error) {
        console.error('Error during backup:', error);
    }
}

backupProject();