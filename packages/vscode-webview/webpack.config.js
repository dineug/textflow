/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const resolvePath = value => path.resolve(__dirname, value);

module.exports = env => {
  const isAnalyzer = env.target === 'analyzer';

  const config = {
    entry: './src/index',
    output: {
      path: resolvePath('../vscode-extension/public'),
      publicPath: './',
      filename: 'static/js/bundle.[contenthash:8].js',
      chunkFilename: 'static/js/[id].[contenthash:8].js',
      clean: true,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      plugins: [new TsconfigPathsPlugin()],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'swc-loader',
            options: {
              env: {
                targets: 'defaults',
                mode: 'entry',
                coreJs: '3',
              },
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: 'automatic',
                    importSource: 'react',
                  },
                },
              },
            },
          },
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'static/css/bundle.[contenthash:8].css',
        chunkFilename: 'static/css/[id].[contenthash:8].css',
      }),
      new HtmlWebpackPlugin({
        inject: true,
        template: resolvePath('public/index.html'),
      }),
      isAnalyzer && new BundleAnalyzerPlugin(),
    ].filter(Boolean),
    performance: false,
  };

  return config;
};
