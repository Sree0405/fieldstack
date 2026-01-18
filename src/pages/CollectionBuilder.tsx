import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { apiClient } from '@/integrations/api/client';

export default function CollectionBuilder() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDisplay, setNewCollectionDisplay] = useState('');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('TEXT');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await apiClient.getCollections();
      setCollections(response.data || []);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName || !newCollectionDisplay) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await apiClient.createCollection({
        name: newCollectionName.toLowerCase().replace(/\s+/g, '_'),
        displayName: newCollectionDisplay,
        tableName: `${newCollectionName.toLowerCase().replace(/\s+/g, '_')}_collection`,
      });

      setCollections([...collections, response.data]);
      setNewCollectionName('');
      setNewCollectionDisplay('');
      setShowNewForm(false);
      setSelectedCollection(response.data);
    } catch (error) {
      console.error('Failed to create collection:', error);
      alert('Failed to create collection');
    }
  };

  const handleAddField = async () => {
    if (!selectedCollection || !newFieldName) {
      alert('Please select a collection and enter a field name');
      return;
    }

    try {
      await apiClient.addFieldToCollection(selectedCollection.id, {
        name: newFieldName,
        dbColumn: newFieldName.toLowerCase().replace(/\s+/g, '_'),
        type: newFieldType,
        required: newFieldRequired,
      });
      // Refresh selected collection
      const response = await apiClient.getCollectionSchema(selectedCollection.id);
      setSelectedCollection(response.data);
      setNewFieldName('');
      setNewFieldType('TEXT');
      setNewFieldRequired(false);
    } catch (error) {
      console.error('Failed to add field yyy:', error);
      console.log(error);
      alert('Failed to add field');
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        await apiClient.deleteCollection(id);
        setCollections(collections.filter((c) => c.id !== id));
        setSelectedCollection(null);
      } catch (error) {
        console.error('Failed to delete collection:', error);
        alert('Failed to delete collection');
      }
    }
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">🏗️ Collection Builder</h1>
        <p className="text-muted-foreground">
          Create and manage your data collections with dynamic fields
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collections List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Collections</CardTitle>
              <Button size="sm" onClick={() => setShowNewForm(!showNewForm)}>
                {showNewForm ? '✕' : '+'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showNewForm && (
              <div className="space-y-3 p-3 bg-muted rounded">
                <div>
                  <Label className="text-xs">Collection Name</Label>
                  <Input
                    placeholder="posts"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Display Name</Label>
                  <Input
                    placeholder="Blog Posts"
                    value={newCollectionDisplay}
                    onChange={(e) => setNewCollectionDisplay(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <Button size="sm" className="w-full" onClick={handleCreateCollection}>
                  Create Collection
                </Button>
              </div>
            )}

            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-2">
                {collections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No collections yet</p>
                ) : (
                  collections.map((collection) => (
                    <div
                      key={collection.id}
                      className={`p-3 rounded cursor-pointer transition ${
                        selectedCollection?.id === collection.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      onClick={() => setSelectedCollection(collection)}
                    >
                      <div className="font-semibold text-sm">{collection.displayName}</div>
                      <div className="text-xs text-muted-foreground">{collection.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {collection.fields?.length || 0} fields
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Collection Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCollection ? (
            <>
              {/* Collection Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedCollection.displayName}</CardTitle>
                      <CardDescription className="mt-2">
                        <code>{selectedCollection.tableName}</code>
                      </CardDescription>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCollection(selectedCollection.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Fields */}
              <Card>
                <CardHeader>
                  <CardTitle>Fields</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedCollection.fields && selectedCollection.fields.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCollection.fields.map((field: any) => (
                        <div
                          key={field.id}
                          className="flex items-center justify-between p-3 bg-muted rounded"
                        >
                          <div>
                            <div className="font-semibold text-sm">{field.name}</div>
                            <div className="text-xs text-muted-foreground">{field.dbColumn}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{field.type}</Badge>
                            {field.required && <Badge>Required</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No fields yet</p>
                  )}

                  {/* Add Field Form */}
                  <div className="border-t pt-4 space-y-3">
                    <h3 className="font-semibold text-sm">Add New Field</h3>
                    <div>
                      <Label className="text-xs">Field Name</Label>
                      <Input
                        placeholder="title"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Field Type</Label>
                      <Select value={newFieldType} onValueChange={setNewFieldType}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEXT">Text</SelectItem>
                          <SelectItem value="NUMBER">Number</SelectItem>
                          <SelectItem value="BOOLEAN">Boolean</SelectItem>
                          <SelectItem value="DATETIME">DateTime</SelectItem>
                          <SelectItem value="FILE">File</SelectItem>
                          <SelectItem value="RELATION">Relation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="required"
                        checked={newFieldRequired}
                        onCheckedChange={(checked) => setNewFieldRequired(checked as boolean)}
                      />
                      <Label htmlFor="required" className="text-xs font-normal">
                        Required
                      </Label>
                    </div>
                    <Button size="sm" className="w-full" onClick={handleAddField}>
                      Add Field
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/content')}
                  >
                    📝 View {selectedCollection.displayName} Content
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate('/api-explorer')}
                  >
                    🔌 View in API Explorer
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  {collections.length === 0
                    ? 'Create a new collection to get started'
                    : 'Select a collection to view and manage its fields'}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
