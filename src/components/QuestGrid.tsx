import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { HOLOBOT_STATS } from "@/types/holobot";

export const QuestGrid = () => {
  return (
    <div className="space-y-8">
      <Card className="bg-black/20 border-retro-accent">
        <CardHeader>
          <CardTitle>Quests Info</CardTitle>
          <CardDescription className="text-gray-300">
            Use Daily Energy to have your Holobots "Scan" for items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>In game tokens</li>
            <li>Blueprint Pieces that users can combine (5 pieces) to make a new Holobot</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/20 border-retro-accent">
          <CardHeader>
            <CardTitle>Exploration Quest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose your Holobot" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(HOLOBOT_STATS).map(([key, holobot]) => (
                  <SelectItem key={key} value={key.toLowerCase()}>
                    {holobot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full bg-retro-accent hover:bg-retro-accent/80">
              Start Exploration
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-retro-accent">
          <CardHeader>
            <CardTitle>Training Quest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose your Holobot" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(HOLOBOT_STATS).map(([key, holobot]) => (
                  <SelectItem key={key} value={key.toLowerCase()}>
                    {holobot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full bg-retro-accent hover:bg-retro-accent/80">
              Start Training
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};