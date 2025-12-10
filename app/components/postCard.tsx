import { Box, HStack, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router";

import type { KnowhowWithCover } from "~/models/knowhow.server";
import { formatDate } from "~/utils/formatDate";

type Props = {
  knowhow: KnowhowWithCover;
};

export const PostCard = ({ knowhow }: Props) => {
  return (
    <Link to={`/knowhow/${knowhow.id}`}>
      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="sm"
        _hover={{ boxShadow: "md", transform: "translateY(-4px)" }}
        transition="all 0.2s"
      >
        <Image
          src={knowhow.cover?.url || undefined}
          alt="投稿の画像"
          height="200px"
          width="100%"
          objectFit="cover"
        />
        <Box p={5}>
          <Text fontWeight="bold" fontSize="lg" lineClamp={2} mb={2}>
            {knowhow.title}
          </Text>
          <Text fontSize="sm" color="gray.600" lineClamp={3} mb={4}>
            {knowhow.summary}
          </Text>
          <HStack justify="space-between">
            <Text fontSize="xs" color="gray.500">
              {formatDate(knowhow.createdAt)}
            </Text>
            <Text fontSize="xs" color="teal.500" fontWeight="medium">
              タグをここ
            </Text>
          </HStack>
        </Box>
      </Box>
    </Link>
  );
};
