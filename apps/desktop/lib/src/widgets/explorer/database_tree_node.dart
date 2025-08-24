import 'package:flutter/material.dart';
import '../../models/database_schema.dart' as schema;

class DatabaseTreeNode extends StatefulWidget {
  final schema.Database database;
  final String? selectedTable;
  final String? selectedDatabase;
  final Function(String databaseName, String tableName) onTableSelected;
  final Function(String databaseName) onDatabaseSelected;

  const DatabaseTreeNode({
    super.key,
    required this.database,
    this.selectedTable,
    this.selectedDatabase,
    required this.onTableSelected,
    required this.onDatabaseSelected,
  });

  @override
  State<DatabaseTreeNode> createState() => _DatabaseTreeNodeState();
}

class _DatabaseTreeNodeState extends State<DatabaseTreeNode> {
  bool _isExpanded = false;
  bool _tablesExpanded = false;
  bool _collectionsExpanded = false;
  bool _viewsExpanded = false;
  bool _proceduresExpanded = false;
  bool _functionsExpanded = false;

  @override
  void initState() {
    super.initState();
    // Auto-expand if this database is selected
    _isExpanded = widget.selectedDatabase == widget.database.name;
  }

  @override
  void didUpdateWidget(DatabaseTreeNode oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Auto-expand if this database becomes selected
    if (widget.selectedDatabase == widget.database.name && !_isExpanded) {
      setState(() {
        _isExpanded = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSelected = widget.selectedDatabase == widget.database.name;
    
    return Column(
      children: [
        _buildDatabaseHeader(isSelected),
        if (_isExpanded) _buildDatabaseContent(),
      ],
    );
  }

  Widget _buildDatabaseHeader(bool isSelected) {
    return InkWell(
      onTap: () {
        setState(() {
          _isExpanded = !_isExpanded;
        });
        widget.onDatabaseSelected(widget.database.name);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
        color: isSelected 
            ? Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3)
            : null,
        child: Row(
          children: [
            Icon(
              _isExpanded ? Icons.expand_more : Icons.chevron_right,
              size: 20,
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.storage,
              size: 20,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                widget.database.name,
                style: TextStyle(
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected 
                      ? Theme.of(context).colorScheme.onPrimaryContainer
                      : null,
                ),
              ),
            ),
            _buildDatabaseStats(),
          ],
        ),
      ),
    );
  }

  Widget _buildDatabaseStats() {
    final totalTables = widget.database.tables.length;
    final totalCollections = widget.database.collections?.length ?? 0;
    final totalViews = widget.database.views?.length ?? 0;
    final total = totalTables + totalCollections + totalViews;

    if (total == 0) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.outline.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        total.toString(),
        style: TextStyle(
          fontSize: 11,
          color: Theme.of(context).colorScheme.outline,
        ),
      ),
    );
  }

  Widget _buildDatabaseContent() {
    return Padding(
      padding: const EdgeInsets.only(left: 16),
      child: Column(
        children: [
          // Tables
          if (widget.database.tables.isNotEmpty)
            _buildSection(
              title: 'Tables',
              count: widget.database.tables.length,
              icon: Icons.table_chart,
              isExpanded: _tablesExpanded,
              onToggle: () => setState(() => _tablesExpanded = !_tablesExpanded),
              children: widget.database.tables.map((table) => 
                _buildTableItem(table, false)).toList(),
            ),
          
          // Collections (MongoDB)
          if (widget.database.collections?.isNotEmpty == true)
            _buildSection(
              title: 'Collections',
              count: widget.database.collections!.length,
              icon: Icons.account_tree,
              isExpanded: _collectionsExpanded,
              onToggle: () => setState(() => _collectionsExpanded = !_collectionsExpanded),
              children: widget.database.collections!.map((collection) => 
                _buildCollectionItem(collection)).toList(),
            ),
          
          // Views
          if (widget.database.views?.isNotEmpty == true)
            _buildSection(
              title: 'Views',
              count: widget.database.views!.length,
              icon: Icons.visibility,
              isExpanded: _viewsExpanded,
              onToggle: () => setState(() => _viewsExpanded = !_viewsExpanded),
              children: widget.database.views!.map((view) => 
                _buildTableItem(schema.Table(
                  name: view.name,
                  columns: view.columns,
                  indexes: [],
                  foreignKeys: [],
                ), true)).toList(),
            ),
          
          // Stored Procedures
          if (widget.database.procedures?.isNotEmpty == true)
            _buildSection(
              title: 'Procedures',
              count: widget.database.procedures!.length,
              icon: Icons.code,
              isExpanded: _proceduresExpanded,
              onToggle: () => setState(() => _proceduresExpanded = !_proceduresExpanded),
              children: widget.database.procedures!.map((procedure) => 
                _buildProcedureItem(procedure)).toList(),
            ),
          
          // Functions
          if (widget.database.functions?.isNotEmpty == true)
            _buildSection(
              title: 'Functions',
              count: widget.database.functions!.length,
              icon: Icons.functions,
              isExpanded: _functionsExpanded,
              onToggle: () => setState(() => _functionsExpanded = !_functionsExpanded),
              children: widget.database.functions!.map((function) => 
                _buildFunctionItem(function)).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required int count,
    required IconData icon,
    required bool isExpanded,
    required VoidCallback onToggle,
    required List<Widget> children,
  }) {
    return Column(
      children: [
        InkWell(
          onTap: onToggle,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: Row(
              children: [
                Icon(
                  isExpanded ? Icons.expand_more : Icons.chevron_right,
                  size: 16,
                ),
                const SizedBox(width: 4),
                Icon(
                  icon,
                  size: 16,
                  color: Theme.of(context).colorScheme.outline,
                ),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Theme.of(context).colorScheme.outline,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  '($count)',
                  style: TextStyle(
                    fontSize: 11,
                    color: Theme.of(context).colorScheme.outline.withOpacity(0.7),
                  ),
                ),
              ],
            ),
          ),
        ),
        if (isExpanded)
          Padding(
            padding: const EdgeInsets.only(left: 16),
            child: Column(children: children),
          ),
      ],
    );
  }

  Widget _buildTableItem(schema.Table table, bool isView) {
    final isSelected = widget.selectedTable == table.name && 
                     widget.selectedDatabase == widget.database.name;
    
    return InkWell(
      onTap: () => widget.onTableSelected(widget.database.name, table.name),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        color: isSelected 
            ? Theme.of(context).colorScheme.primaryContainer.withOpacity(0.5)
            : null,
        child: Row(
          children: [
            Icon(
              isView ? Icons.visibility : Icons.table_rows,
              size: 14,
              color: isSelected 
                  ? Theme.of(context).colorScheme.onPrimaryContainer
                  : Theme.of(context).colorScheme.outline,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                table.name,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w500 : FontWeight.normal,
                  color: isSelected 
                      ? Theme.of(context).colorScheme.onPrimaryContainer
                      : null,
                ),
              ),
            ),
            if (table.rowCount != null)
              Text(
                _formatNumber(table.rowCount!),
                style: TextStyle(
                  fontSize: 10,
                  color: Theme.of(context).colorScheme.outline.withOpacity(0.7),
                ),
              ),
            const SizedBox(width: 8),
            PopupMenuButton<String>(
              icon: Icon(
                Icons.more_horiz,
                size: 14,
                color: Theme.of(context).colorScheme.outline,
              ),
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'view_structure',
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, size: 16),
                      const SizedBox(width: 8),
                      Text(isView ? 'View Structure' : 'Table Structure'),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'sample_data',
                  child: const Row(
                    children: [
                      Icon(Icons.preview, size: 16),
                      SizedBox(width: 8),
                      Text('Sample Data'),
                    ],
                  ),
                ),
                if (!isView)
                  const PopupMenuItem(
                    value: 'insert_data',
                    child: Row(
                      children: [
                        Icon(Icons.add, size: 16),
                        SizedBox(width: 8),
                        Text('Insert Data'),
                      ],
                    ),
                  ),
              ],
              onSelected: (value) => _handleTableAction(table, value),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCollectionItem(schema.Collection collection) {
    final isSelected = widget.selectedTable == collection.name && 
                     widget.selectedDatabase == widget.database.name;
    
    return InkWell(
      onTap: () => widget.onTableSelected(widget.database.name, collection.name),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        color: isSelected 
            ? Theme.of(context).colorScheme.primaryContainer.withOpacity(0.5)
            : null,
        child: Row(
          children: [
            Icon(
              Icons.account_tree,
              size: 14,
              color: isSelected 
                  ? Theme.of(context).colorScheme.onPrimaryContainer
                  : Theme.of(context).colorScheme.outline,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                collection.name,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w500 : FontWeight.normal,
                  color: isSelected 
                      ? Theme.of(context).colorScheme.onPrimaryContainer
                      : null,
                ),
              ),
            ),
            if (collection.documentCount != null)
              Text(
                _formatNumber(collection.documentCount!),
                style: TextStyle(
                  fontSize: 10,
                  color: Theme.of(context).colorScheme.outline.withOpacity(0.7),
                ),
              ),
            const SizedBox(width: 8),
            PopupMenuButton<String>(
              icon: Icon(
                Icons.more_horiz,
                size: 14,
                color: Theme.of(context).colorScheme.outline,
              ),
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'view_structure',
                  child: Row(
                    children: [
                      Icon(Icons.info_outline, size: 16),
                      SizedBox(width: 8),
                      Text('Collection Info'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'sample_data',
                  child: Row(
                    children: [
                      Icon(Icons.preview, size: 16),
                      SizedBox(width: 8),
                      Text('Sample Documents'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'insert_data',
                  child: Row(
                    children: [
                      Icon(Icons.add, size: 16),
                      SizedBox(width: 8),
                      Text('Insert Document'),
                    ],
                  ),
                ),
              ],
              onSelected: (value) => _handleCollectionAction(collection, value),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProcedureItem(schema.StoredProcedure procedure) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      child: Row(
        children: [
          Icon(
            Icons.code,
            size: 14,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              procedure.name,
              style: const TextStyle(fontSize: 12),
            ),
          ),
          Text(
            '${procedure.parameters.length} params',
            style: TextStyle(
              fontSize: 10,
              color: Theme.of(context).colorScheme.outline.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFunctionItem(schema.DatabaseFunction function) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      child: Row(
        children: [
          Icon(
            Icons.functions,
            size: 14,
            color: Theme.of(context).colorScheme.outline,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              function.name,
              style: const TextStyle(fontSize: 12),
            ),
          ),
          Text(
            function.returnType,
            style: TextStyle(
              fontSize: 10,
              color: Theme.of(context).colorScheme.outline.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }

  String _formatNumber(int number) {
    if (number < 1000) return number.toString();
    if (number < 1000000) return '${(number / 1000).toStringAsFixed(1)}K';
    return '${(number / 1000000).toStringAsFixed(1)}M';
  }

  void _handleTableAction(schema.Table table, String action) {
    // TODO: Implement table actions in future tasks
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$action for table "${table.name}" - Coming soon!'),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _handleCollectionAction(schema.Collection collection, String action) {
    // TODO: Implement collection actions in future tasks
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$action for collection "${collection.name}" - Coming soon!'),
        duration: const Duration(seconds: 2),
      ),
    );
  }
}