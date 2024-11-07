import { Button } from "@/components/ui/button";
import { Calendar } from "../components/Calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "../components/Util";
import { format, parse } from "date-fns";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "../components/UseToast";
import brain from "brain";
import { CalendarIcon } from "lucide-react";

interface AgeGroup {
  name: string;
  birthdateStart: Date | undefined;
  birthdateEnd: Date | undefined;
}

interface LeagueFormData {
  leagueName: string;
  numberOfGroups: number;
  ageGroups: AgeGroup[];
}

const DateInput = ({ value, onChange, placeholder }: { value: Date | undefined, onChange: (date: Date | undefined) => void, placeholder?: string }) => {
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, "yyyy-MM-dd"));
    }
  }, [value]);
  return (
    <div className="relative">
      <Input
        type="text"
        placeholder={placeholder || "YYYY-MM-DD"}
        value={inputValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setInputValue(newValue);
          try {
            const date = parse(newValue, "yyyy-MM-dd", new Date());
            if (date.toString() !== "Invalid Date") {
              onChange(date);
            }
          } catch (error) {
            // Invalid date format, ignore
          }
        }}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="absolute right-2 top-2.5 h-4 w-4 p-0"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default function CreateLeague() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeagueFormData>({
    defaultValues: {
      ageGroups: []
    }
  })

  const numberOfGroups = watch("numberOfGroups")

  React.useEffect(() => {
    const newGroups = Array(Number(numberOfGroups) || 0).fill(null).map((_, index) => ({
      name: `Group ${index + 1}`,
      birthdateStart: undefined,
      birthdateEnd: undefined
    }))
    setValue("ageGroups", newGroups)
  }, [numberOfGroups, setValue])

  const { toast } = useToast();

  const onSubmit = async (data: LeagueFormData) => {
    // Validate that all required fields are filled
    const hasEmptyGroup = data.ageGroups.some(group => 
      !group.name || (!group.birthdateStart && !group.birthdateEnd)
    );

    if (hasEmptyGroup) {
      toast({
        title: "Validation Error",
        description: "Please fill in all group names and at least one date range per group.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Convert dates to ISO strings for API
      const requestData = {
        leagueName: data.leagueName,
        numberOfGroups: data.numberOfGroups,
        ageGroups: data.ageGroups.map(group => ({
          name: group.name,
          birthdateStart: group.birthdateStart?.toISOString().split('T')[0],
          birthdateEnd: group.birthdateEnd?.toISOString().split('T')[0]
        }))
      };

      const response = await brain.create_league(requestData);

      if (response.ok) {
        toast({
          title: "Success!",
          description: "League created successfully",
          variant: "default"
        });
        navigate("/");
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error creating league:", error);
      toast({
        title: "Error",
        description: "Failed to create league. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate("/")}>
        <Trophy className="h-8 w-8 text-primary hover:text-primary/80" />
        <h1 className="text-4xl font-bold" style={{ fontFamily: "Bebas Neue" }}>
          CREATE NEW LEAGUE
        </h1>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* League Name */}
          <div className="space-y-2">
            <Label htmlFor="leagueName">League Name</Label>
            <Input
              id="leagueName"
              {...register("leagueName", {
                required: "League name is required",
              })}
              placeholder="Enter league name"
            />
            {errors.leagueName && (
              <p className="text-sm text-destructive">
                {errors.leagueName.message}
              </p>
            )}
          </div>

          {/* Number of Age Groups */}
          <div className="space-y-2">
            <Label htmlFor="numberOfGroups">Number of Age Groups</Label>
            <p className="text-sm text-muted-foreground mt-1">Each group will have its own birthdate range to determine player eligibility</p>
            <Input
              id="numberOfGroups"
              type="number"
              {...register("numberOfGroups", {
                required: "Number of age groups is required",
                min: { value: 1, message: "Must have at least 1 age group" },
              })}
            />
            {errors.numberOfGroups && (
              <p className="text-sm text-destructive">
                {errors.numberOfGroups.message}
              </p>
            )}
          </div>

          {/* Age Groups Configuration */}
          {watch("ageGroups")?.map((group, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Group {index + 1} Name</Label>
                <Input
                  {...register(`ageGroups.${index}.name` as const)}
                  placeholder={`Group ${index + 1}`}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Birthdate Range Start</Label>
                  <p className="text-sm text-muted-foreground">Players born on or after this date are eligible</p>
                  <DateInput
                    value={watch(`ageGroups.${index}.birthdateStart`)}
                    onChange={(date) => setValue(`ageGroups.${index}.birthdateStart`, date)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Birthdate Range End</Label>
                  <p className="text-sm text-muted-foreground">Players born on or before this date are eligible</p>
                  <DateInput
                    value={watch(`ageGroups.${index}.birthdateEnd`)}
                    onChange={(date) => setValue(`ageGroups.${index}.birthdateEnd`, date)}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg">
            Create League
          </Button>
        </form>
      </Card>
    </div>
  );
}