
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { HOLOBOT_STATS } from "@/types/holobot";

export const QuestGrid = () => {
  return (
    <div className="space-y-8">
      <Card className="glass-morphism border-holobots-accent">
        <CardHeader>
          <CardTitle className="text-2xl text-holobots-accent">Quests Info</CardTitle>
          <CardDescription className="text-lg text-foreground/90">
            Use Daily Energy to have your Holobots "Scan" for items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-foreground/80">
            <li>In game tokens</li>
            <li>Blueprint Pieces that users can combine (5 pieces) to make a new Holobot</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-morphism border-holobots-accent">
          <CardHeader>
            <CardTitle className="text-xl text-holobots-accent">Exploration Quest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select>
              <SelectTrigger className="border-holobots-accent/50 text-foreground">
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
            <Button className="w-full bg-holobots-accent hover:bg-holobots-hover text-white">
              Start Exploration
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-holobots-accent">
          <CardHeader>
            <CardTitle className="text-xl text-holobots-accent">Training Quest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select>
              <SelectTrigger className="border-holobots-accent/50 text-foreground">
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
            <Button className="w-full bg-holobots-accent hover:bg-holobots-hover text-white">
              Start Training
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
