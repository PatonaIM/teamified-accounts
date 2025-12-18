import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnvironmentToRedirectUris1765600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const clients = await queryRunner.query(`
      SELECT id, redirect_uris, metadata 
      FROM oauth_clients 
      WHERE deleted_at IS NULL
    `);

    for (const client of clients) {
      let uris: string[] = [];
      
      if (client.redirect_uris) {
        if (typeof client.redirect_uris === 'string') {
          uris = client.redirect_uris.split(',').filter((u: string) => u.trim());
        } else if (Array.isArray(client.redirect_uris)) {
          uris = client.redirect_uris.filter((u: unknown) => typeof u === 'string' && u.trim());
        }
      }

      const newRedirectUris = uris.map((uri: string) => {
        const isReplitApp = uri.includes('.replit.app');
        return {
          uri: uri.trim(),
          environment: isReplitApp ? 'production' : 'development',
        };
      });

      const metadata = client.metadata || {};
      delete metadata.environment;

      await queryRunner.query(
        `UPDATE oauth_clients SET redirect_uris = $1, metadata = $2 WHERE id = $3`,
        [JSON.stringify(newRedirectUris), JSON.stringify(metadata), client.id]
      );
    }

    console.log(`Migration complete: Updated ${clients.length} OAuth clients with environment-tagged redirect URIs`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const clients = await queryRunner.query(`
      SELECT id, redirect_uris 
      FROM oauth_clients 
      WHERE deleted_at IS NULL
    `);

    for (const client of clients) {
      let uris: string[] = [];

      if (client.redirect_uris && Array.isArray(client.redirect_uris)) {
        uris = client.redirect_uris.map((r: { uri?: string } | string) => 
          typeof r === 'string' ? r : r.uri
        ).filter(Boolean);
      }

      await queryRunner.query(
        `UPDATE oauth_clients SET redirect_uris = $1 WHERE id = $2`,
        [uris.join(','), client.id]
      );
    }

    console.log(`Rollback complete: Reverted ${clients.length} OAuth clients to simple URI format`);
  }
}
