// ** Import 3rd Party Libs
import { PlusIcon } from "lucide-react";

// ** Import UI Components
import { Button } from "@/components/ui/button";

export const ToolbarOptions = () => {
  const AddButton = () => (
    <Button size="sm" variant="outline">
      <PlusIcon className="mr-2 h-4 w-4" />
      Add User
    </Button>
  );

  return (
    <div>
      <AddButton />
    </div>
  );
};
