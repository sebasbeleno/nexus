import { 
	Card, 
	CardContent, 
	CardDescription, 
	CardHeader, 
	CardTitle 
} from "@workspace/ui/components/card";

interface KPICardProps {
	title: string;
	description: string;
	value: number;
}

export const KPICard = ({ title, description, value }: KPICardProps) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<span>{value}</span>
			</CardContent>
		</Card>
	)
}