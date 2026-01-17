import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Database, Eye, Edit, Trash2 } from "lucide-react";
import { useCollections, useDeleteCollection } from "@/hooks/useCollections";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCollection } from "@/hooks/useCollections";

export default function Collections() {
  const { data: collections, isLoading } = useCollections();
  const deleteCollection = useDeleteCollection();
  const createCollection = useCreateCollection();
  const [open, setOpen] = useState(false);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await createCollection.mutateAsync({
      name: formData.get('name') as string,
      displayName: formData.get('displayName') as string,
      tableName: formData.get('tableName') as string,
    });
    
    setOpen(false);
    e.currentTarget.reset();
  };

  if (isLoading) {
    return <div>Loading collections...</div>;
  }
  console.log(collections)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Collections</h1>
          <p className="text-muted-foreground mt-2">
            Manage your data models and schemas
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input id="display_name" name="displayName" placeholder="Products" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Collection Name</Label>
                <Input id="name" name="name" placeholder="products" required pattern="[a-z_]+" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="table_name">Table Name</Label>
                <Input id="table_name" name="tableName" placeholder="products" required pattern="[a-z_]+" />
              </div>
              <Button type="submit" className="w-full">Create Collection</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {collections?.map((collection) => (
          <Card key={collection.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {collection.displayName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {collection.tableName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <Button variant="ghost" size="sm" className="flex-1 gap-2">
                <Eye className="h-4 w-4" />
                View
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-destructive hover:text-destructive"
                onClick={() => deleteCollection.mutate(collection.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
