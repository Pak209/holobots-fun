import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HOLOBOT_STATS, HolobotStats, getRank } from "@/types/holobot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { calculateExperience, getExperienceProgress } from "@/utils/battleUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface HolobotInfoCardProps {
  holobot: any;
}

export const HolobotInfoCard = ({ holobot }: HolobotInfoCardProps) => {
  const holobotKey = holobot.name.toLowerCase();
  const baseStats = HOLOBOT_STATS[holobotKey];
  
  if (!baseStats) {
    return (
      <Card className="w-full glass-morphism border-none">
        <CardHeader>
          <CardTitle>Holobot Not Found</CardTitle>
          <CardDescription>
            The requested Holobot could not be found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please check the Holobot name and try again.</p>
        </CardContent>
      </Card>
    );
  }

  const level = holobot.level || 1;
  const rank = getRank(level);
  const nextLevelExp = calculateExperience(level);
  
  const maxHealthChecked = holobot.maxHealth || 100;
  const progress = getExperienceProgress(holobot.experience || 0, level);

  return (
    <Card className="w-full glass-morphism border-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {baseStats.name}
          <Badge variant="secondary">{rank}</Badge>
        </CardTitle>
        <CardDescription>
          {baseStats.abilityDescription}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={`/images/holobots/${holobotKey}.png`} />
            <AvatarFallback>{baseStats.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Level {level}</p>
            <Progress value={progress.progress} />
            <p className="text-xs text-muted-foreground">
              {holobot.experience || 0}/{nextLevelExp} XP
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm font-medium">Attack</span>
            <span className="text-sm text-muted-foreground">{baseStats.attack}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm font-medium">Defense</span>
            <span className="text-sm text-muted-foreground">{baseStats.defense}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm font-medium">Speed</span>
            <span className="text-sm text-muted-foreground">{baseStats.speed}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm font-medium">Health</span>
            <span className="text-sm text-muted-foreground">{maxHealthChecked}</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium">Special Move</h3>
          <p className="text-sm text-muted-foreground">{baseStats.specialMove}</p>
          <p className="text-xs text-gray-500">{baseStats.abilityStats}</p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <Button>Sync</Button>
        <Button variant="secondary">View Details</Button>
      </CardFooter>
    </Card>
  );
};

interface HolobotCardProps {
    holobots: any[];
    isLoading: boolean;
}

export function HolobotsCard({ holobots, isLoading }: HolobotCardProps) {
    return (
        <Card className="col-span-2 md:col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Holobots</CardTitle>
                <CardDescription>
                    Here you can see your Holobots
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-4 pb-4">
                <ScrollArea className="h-[300px] w-full pr-4">
                    <div className="grid gap-4">
                        {isLoading ? (
                            <>
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </>
                        ) : (
                            holobots.map((holobot: any) => (
                                <div key={holobot.id} className="flex items-center justify-between space-x-4 rounded-md border p-4">
                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarImage src={`/images/holobots/${holobot.name.toLowerCase()}.png`} alt={holobot.name} />
                                            <AvatarFallback>{holobot.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium leading-none">{holobot.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Level {holobot.level}
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="sm">View</Button>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
