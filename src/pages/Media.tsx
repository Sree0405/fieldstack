import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image, FileText, File } from "lucide-react";

const mockFiles = [
  { id: "1", name: "hero-banner.jpg", type: "image", size: "2.4 MB", date: "2024-01-15" },
  { id: "2", name: "product-catalog.pdf", type: "document", size: "1.8 MB", date: "2024-01-14" },
  { id: "3", name: "logo.svg", type: "image", size: "24 KB", date: "2024-01-13" },
  { id: "4", name: "user-guide.pdf", type: "document", size: "3.2 MB", date: "2024-01-12" },
  { id: "5", name: "thumbnail.png", type: "image", size: "156 KB", date: "2024-01-11" },
  { id: "6", name: "data-export.csv", type: "file", size: "892 KB", date: "2024-01-10" },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case "image":
      return Image;
    case "document":
      return FileText;
    default:
      return File;
  }
};

export default function Media() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Media Library</h1>
          <p className="text-muted-foreground mt-2">
            Manage your files and assets
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Files
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {mockFiles.map((file) => {
          const Icon = getFileIcon(file.type);
          return (
            <Card
              key={file.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="rounded-lg bg-muted p-4">
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="w-full">
                  <p className="font-medium text-sm text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {file.size}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file.date}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
