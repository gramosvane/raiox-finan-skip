migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    const collection = new Collection({
      name: 'diagnostics',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: usersCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'total_score',
          type: 'number',
          required: true,
        },
        {
          name: 'income_score',
          type: 'number',
          required: true,
        },
        {
          name: 'expenses_score',
          type: 'number',
          required: true,
        },
        {
          name: 'debts_score',
          type: 'number',
          required: true,
        },
        {
          name: 'savings_score',
          type: 'number',
          required: true,
        },
        {
          name: 'answers',
          type: 'json',
          required: true,
        },
        {
          name: 'summary',
          type: 'text',
          required: false,
        },
        {
          name: 'recommendations',
          type: 'json',
          required: false,
        },
        {
          name: 'created',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        'CREATE INDEX idx_diagnostics_user ON diagnostics (user)',
        'CREATE INDEX idx_diagnostics_created ON diagnostics (created)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('diagnostics')
      app.delete(collection)
    } catch (_) {}
  },
)
