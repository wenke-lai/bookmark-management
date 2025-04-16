"use client";

import { FileUpload } from "@/components/file-upload";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
}

export default function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [formData, setFormData] = useState<Omit<Bookmark, "id">>({
    title: "",
    url: "",
    description: "",
    tags: [],
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem("bookmarks");
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  useEffect(() => {
    // Save bookmarks to localStorage
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setBookmarks(
        bookmarks.map((b) =>
          b.id === editingId ? { ...formData, id: editingId } : b
        )
      );
      setEditingId(null);
    } else {
      setBookmarks([...bookmarks, { ...formData, id: Date.now().toString() }]);
    }
    setFormData({ title: "", url: "", description: "", tags: [] });
  };

  const handleDelete = (id: string) => {
    setBookmarks(bookmarks.filter((b) => b.id !== id));
  };

  const handleEdit = (bookmark: Bookmark) => {
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description || "",
      tags: bookmark.tags || [],
    });
    setEditingId(bookmark.id);
  };

  const handleFileUpload = (content: string) => {
    try {
      // Parse HTML content for bookmarks
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const links = doc.querySelectorAll("a");

      const newBookmarks: Bookmark[] = Array.from(links).map((link) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: link.textContent || "Untitled",
        url: link.href,
        description: link.getAttribute("description") || undefined,
        tags:
          link
            .getAttribute("tags")
            ?.split(",")
            .map((tag) => tag.trim()) || [],
      }));

      setBookmarks((prev) => [...prev, ...newBookmarks]);
    } catch (error) {
      console.error("Error parsing bookmarks file:", error);
    }
  };

  const handleExport = () => {
    const htmlContent = `
      <!DOCTYPE NETSCAPE-Bookmark-file-1>
      <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
      <TITLE>Bookmarks</TITLE>
      <H1>Bookmarks</H1>
      <DL><p>
        ${bookmarks
          .map(
            (bookmark) => `
          <DT><A HREF="${bookmark.url}"${
              bookmark.description
                ? ` DESCRIPTION="${bookmark.description}"`
                : ""
            }${
              bookmark.tags?.length ? ` TAGS="${bookmark.tags.join(",")}"` : ""
            }>${bookmark.title}</A>
        `
          )
          .join("")}
      </DL><p>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookmarks.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Bookmarks</h2>
          <Button onClick={handleExport} variant="outline">
            Export Bookmarks
          </Button>
        </div>

        <Tabs defaultValue="add" className="space-y-4">
          <TabsList>
            <TabsTrigger value="add">Add Bookmark</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingId ? "Edit Bookmark" : "Add New Bookmark"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags?.join(", ")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tags: e.target.value
                            .split(",")
                            .map((tag) => tag.trim()),
                        })
                      }
                    />
                  </div>
                  <Button type="submit">
                    {editingId ? "Update Bookmark" : "Add Bookmark"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import">
            <FileUpload onFileUpload={handleFileUpload} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 space-y-4">
          {bookmarks.map((bookmark) => (
            <Card key={bookmark.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{bookmark.title}</h3>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {bookmark.url}
                    </a>
                    {bookmark.description && (
                      <p className="text-muted-foreground">
                        {bookmark.description}
                      </p>
                    )}
                    {bookmark.tags && bookmark.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {bookmark.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(bookmark)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(bookmark.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
