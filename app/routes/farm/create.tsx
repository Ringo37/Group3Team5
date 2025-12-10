import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  Heading,
  Field,
  Select,
  createListCollection,
  Portal,
} from "@chakra-ui/react";
import { useRef, useEffect } from "react";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";

import { getAllCrops } from "~/models/crop.server";
import { createFarm } from "~/models/farm.server";
import { getUserId } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const region = formData.get("region") as string;
  const areaHa = Number(formData.get("areaHa"));
  const seasonalCalendar = formData.get("seasonalCalendar") as string;
  const cropId = Number(formData.get("cropId"));

  const errors: Record<string, string> = {};
  if (!name) errors.name = "農場名は必須です";
  if (!region) errors.region = "地域は必須です";
  if (!areaHa || isNaN(areaHa)) errors.areaHa = "面積は数値で入力してください";

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  await createFarm({
    userId: userId,
    name: name,
    region: region,
    areaHa: areaHa,
    seasonalCalendar: seasonalCalendar,
    cropId: cropId,
  });

  return redirect("/mypage");
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");
  const crops = await getAllCrops();
  return { crops };
}
export default function FarmCreate() {
  const { crops } = useLoaderData<typeof loader>();
  const cropsCollection = createListCollection({
    items: crops.map((crop) => ({
      label: crop.name,
      value: crop.id,
    })),
  });
  console.log(cropsCollection);
  const actionData = useActionData<typeof action>();
  const nameRef = useRef<HTMLInputElement>(null);
  const regionRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.name) nameRef.current?.focus();
    else if (actionData?.errors?.region) regionRef.current?.focus();
    else if (actionData?.errors?.areaHa) areaRef.current?.focus();
  }, [actionData]);

  return (
    <Box p={8} maxW="600px" mx="auto">
      <Heading mb={6}>農場を追加</Heading>
      <Form method="post">
        <VStack gap={4} align="stretch">
          {/* 農場名 */}
          <Field.Root invalid={!!actionData?.errors?.name}>
            <Input
              placeholder="農場名"
              name="name"
              ref={nameRef}
              aria-describedby="name-error"
            />
            <Field.ErrorText id="name-error">
              {actionData?.errors?.name}
            </Field.ErrorText>
          </Field.Root>

          {/* 地域 */}
          <Field.Root invalid={!!actionData?.errors?.region}>
            <Input
              placeholder="地域"
              name="region"
              ref={regionRef}
              aria-describedby="region-error"
            />
            <Field.ErrorText id="region-error">
              {actionData?.errors?.region}
            </Field.ErrorText>
          </Field.Root>

          {/* 面積 */}
          <Field.Root invalid={!!actionData?.errors?.areaHa}>
            <Input
              placeholder="面積 (ha)"
              type="number"
              name="areaHa"
              ref={areaRef}
              aria-describedby="area-error"
            />
            <Field.ErrorText id="area-error">
              {actionData?.errors?.areaHa}
            </Field.ErrorText>
          </Field.Root>

          {/* 作付けカレンダー */}
          <Field.Root>
            <Textarea placeholder="作付けカレンダー" name="seasonalCalendar" />
          </Field.Root>

          {/* 作物を選択 */}
          <Field.Root>
            <Select.Root name="cropId" collection={cropsCollection}>
              <Select.HiddenSelect />
              <Select.Label>作物を選択</Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="作物を選択してください" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {cropsCollection.items.map((crop) => (
                      <Select.Item key={crop.value} item={crop}>
                        {crop.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Field.Root>

          <Button type="submit" colorScheme="green" size="lg">
            農場を作成
          </Button>
        </VStack>
      </Form>
    </Box>
  );
}
