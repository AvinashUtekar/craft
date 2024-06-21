import { SearchInput } from "@app/components/search/SearchInput";
import { ShowRecentSearches } from "@app/components/search/ShowRecentSearches";
import { ShowSearchResults } from "@app/components/search/ShowSearchResults";
import { PaginatedArticle, getArticlesPaginated } from "@app/services/articles";
import { VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { GetServerSideProps, InferGetServerSidePropsType } from "next/types";
import { useEffect, useState } from "react";

const LIMIT = 5;
const INITIAL_OFFSET = 0;

export const getServerSideProps: GetServerSideProps<{
    articles: PaginatedArticle[];
    likes: Record<string, number>;
    totalCount: number;
    nextOffset: number;
}> = async function (ctx) {
    const query = ctx.query.q as string | null | undefined;
    if (!query) {
        return {
            props: {
                articles: [],
                likes: {},
                totalCount: 0,
                nextOffset: 0,
                query: null,
            },
        };
    }

    const res = await getArticlesPaginated(LIMIT, INITIAL_OFFSET, query);
    return {
        props: {
            articles: res.articles ?? [],
            likes: res.likes ?? {},
            totalCount: res.totalCount ?? 0,
            nextOffset: res.nextOffset ?? 0,
        },
    };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

export default function SearchPage(props: Props) {
    const { articles, likes, totalCount, nextOffset } = props;
    const router = useRouter();
    const [searchText, setSearchText] = useState<string>(
        (router.query.q as string) ?? ""
    );

    useEffect(
        function setText() {
            if (router.isReady) {
                setSearchText((router.query.q as string) ?? "");
            }
        },
        [router.isReady]
    );

    return (
        <VStack
            as="main"
            my={{ base: "2rem", sm: "4rem" }}
            mt={{ base: "calc(1rem + 70px)", sm: "calc(4rem + 70px)" }}
            w="100%"
            justifyContent="center"
        >
            <VStack
                maxWidth="700px"
                w="100%"
                px="1rem"
                alignItems="start"
                gap="16px"
            >
                <SearchInput />

                {router.query.q == null || router.query.q === "" ? (
                    <ShowRecentSearches />
                ) : (
                    <ShowSearchResults
                        articles={articles}
                        likes={likes}
                        totalCount={totalCount}
                        nextOffset={nextOffset}
                    />
                )}
            </VStack>
        </VStack>
    );
}
