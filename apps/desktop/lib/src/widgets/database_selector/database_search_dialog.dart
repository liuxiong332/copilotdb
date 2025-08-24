import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/database_schema.dart' as schema;
import '../../providers/database_provider.dart';
import '../../services/database_schema_service.dart';

class DatabaseSearchDialog extends StatefulWidget {
  const DatabaseSearchDialog({super.key});

  @override
  State<DatabaseSearchDialog> createState() => _DatabaseSearchDialogState();
}

class _DatabaseSearchDialogState extends State<DatabaseSearchDialog> {
  final TextEditingController _searchController = TextEditingController();
  final DatabaseSchemaService _schemaService = DatabaseSchemaService();
  
  schema.DatabaseSchema? _schema;
  List<SearchResult> _searchResults = [];
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadSchema();
    _searchController.addListener(_performSearch);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Container(
        width: 600,
        height: 500,
        child: Column(
          children: [
            _buildHeader(),
            _buildSearchField(),
            Expanded(child: _buildSearchResults()),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          bottom: BorderSide(
            color: Theme.of(context).dividerColor,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          const Icon(Icons.search),
          const SizedBox(width: 8),
          const Expanded(
            child: Text(
              'Search Databases and Tables',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          IconButton(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.close),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchField() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: TextField(
        controller: _searchController,
        autofocus: true,
        decoration: InputDecoration(
          hintText: 'Search for databases, tables, or columns...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  onPressed: () {
                    _searchController.clear();
                    _performSearch();
                  },
                  icon: const Icon(Icons.clear),
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
    );
  }

  Widget _buildSearchResults() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Loading database schema...'),
          ],
        ),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Failed to Load Schema',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.error,
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _loadSchema,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_searchController.text.isEmpty) {
      return _buildInitialState();
    }

    if (_searchResults.isEmpty) {
      return _buildNoResultsState();
    }

    return _buildResultsList();
  }

  Widget _buildInitialState() {
    if (_schema == null) {
      return const Center(
        child: Text(
          'Enter a search term to find databases, tables, or columns',
          style: TextStyle(color: Colors.grey),
        ),
      );
    }

    return ListView(
      children: [
        if (_schema!.databases.isNotEmpty) ...[
          _buildSectionHeader('All Databases'),
          ..._schema!.databases.map((db) => _buildDatabaseTile(db)),
        ],
      ],
    );
  }

  Widget _buildNoResultsState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 64,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(height: 16),
          Text(
            'No Results Found',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).colorScheme.outline,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try a different search term',
            style: TextStyle(
              color: Theme.of(context).colorScheme.outline,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsList() {
    final groupedResults = <String, List<SearchResult>>{};
    
    for (final result in _searchResults) {
      final key = result.database;
      groupedResults.putIfAbsent(key, () => []).add(result);
    }

    return ListView(
      children: [
        for (final entry in groupedResults.entries) ...[
          _buildSectionHeader('Database: ${entry.key}'),
          ...entry.value.map((result) => _buildSearchResultTile(result)),
        ],
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Theme.of(context).colorScheme.surfaceVariant,
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Theme.of(context).colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }

  Widget _buildDatabaseTile(schema.Database database) {
    return ExpansionTile(
      leading: const Icon(Icons.folder),
      title: Text(database.name),
      subtitle: Text('${database.tables.length} tables'),
      children: database.tables.map((table) => _buildTableTile(database.name, table)).toList(),
    );
  }

  Widget _buildTableTile(String databaseName, schema.Table table) {
    return ListTile(
      leading: const Padding(
        padding: EdgeInsets.only(left: 16),
        child: Icon(Icons.table_chart, size: 20),
      ),
      title: Text(table.name),
      subtitle: Text('${table.columns.length} columns'),
      onTap: () => _selectTable(databaseName, table.name),
    );
  }

  Widget _buildSearchResultTile(SearchResult result) {
    IconData icon;
    String subtitle;
    
    switch (result.type) {
      case SearchResultType.database:
        icon = Icons.folder;
        subtitle = 'Database';
        break;
      case SearchResultType.table:
        icon = Icons.table_chart;
        subtitle = 'Table in ${result.database}';
        break;
      case SearchResultType.column:
        icon = Icons.view_column;
        subtitle = 'Column in ${result.database}.${result.table}';
        break;
    }

    return ListTile(
      leading: Icon(icon),
      title: Text(result.name),
      subtitle: Text(subtitle),
      onTap: () {
        if (result.type == SearchResultType.table || result.type == SearchResultType.column) {
          _selectTable(result.database, result.table!);
        }
      },
    );
  }

  void _loadSchema() async {
    final provider = context.read<DatabaseProvider>();
    final activeConnection = provider.activeConnection;
    
    if (activeConnection == null) {
      setState(() {
        _errorMessage = 'No active database connection';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final schema = await _schemaService.getSchema(activeConnection);
      if (mounted) {
        setState(() {
          _schema = schema;
          _isLoading = false;
        });
        _performSearch();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  void _performSearch() {
    if (_schema == null) return;

    final query = _searchController.text.toLowerCase().trim();
    if (query.isEmpty) {
      setState(() {
        _searchResults = [];
      });
      return;
    }

    final results = <SearchResult>[];

    for (final database in _schema!.databases) {
      // Search database names
      if (database.name.toLowerCase().contains(query)) {
        results.add(SearchResult(
          type: SearchResultType.database,
          name: database.name,
          database: database.name,
        ));
      }

      // Search table names
      for (final table in database.tables) {
        if (table.name.toLowerCase().contains(query)) {
          results.add(SearchResult(
            type: SearchResultType.table,
            name: table.name,
            database: database.name,
            table: table.name,
          ));
        }

        // Search column names
        for (final column in table.columns) {
          if (column.name.toLowerCase().contains(query)) {
            results.add(SearchResult(
              type: SearchResultType.column,
              name: column.name,
              database: database.name,
              table: table.name,
            ));
          }
        }
      }
    }

    setState(() {
      _searchResults = results;
    });
  }

  void _selectTable(String databaseName, String tableName) {
    Navigator.of(context).pop();
    // TODO: In future tasks, this will trigger the query editor or table view
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Selected: $databaseName.$tableName'),
        duration: const Duration(seconds: 2),
      ),
    );
  }
}

enum SearchResultType {
  database,
  table,
  column,
}

class SearchResult {
  final SearchResultType type;
  final String name;
  final String database;
  final String? table;

  SearchResult({
    required this.type,
    required this.name,
    required this.database,
    this.table,
  });
}