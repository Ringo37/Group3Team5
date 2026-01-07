import { Heading, Text, List } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
};

export function MarkdownContent({ content }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: (props) => <Heading as="h1" size="xl" mt={6} mb={4} {...props} />,
        h2: (props) => <Heading as="h2" size="lg" mt={6} mb={3} {...props} />,
        h3: (props) => <Heading as="h3" size="md" mt={4} mb={2} {...props} />,
        p: (props) => <Text mb={4} lineHeight="1.8" {...props} />,
        ul: (props) => <List.Root as="ul" pl={6} mb={4} {...props} />,
        ol: (props) => <List.Root as="ol" pl={6} mb={4} {...props} />,
        li: (props) => <List.Item mb={1} {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
